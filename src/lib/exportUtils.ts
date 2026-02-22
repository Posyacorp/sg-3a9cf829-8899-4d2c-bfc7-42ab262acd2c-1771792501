import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

// Export data to CSV
export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export multiple datasets to CSV (one file with multiple sheets simulation)
export function exportMultipleToCSV(datasets: { name: string; data: any[] }[], filename: string) {
  let csvContent = "";
  
  datasets.forEach((dataset, index) => {
    csvContent += `\n\n=== ${dataset.name} ===\n`;
    csvContent += Papa.unparse(dataset.data);
  });
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export chart to PDF
export async function exportChartToPDF(
  chartElement: HTMLElement,
  title: string,
  filename: string
) {
  const html2canvas = (await import("html2canvas")).default;
  
  const canvas = await html2canvas(chartElement, {
    scale: 2,
    backgroundColor: "#0f0a1f",
    logging: false,
  });
  
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  
  // Add title
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, 20, 30);
  
  // Add chart image
  pdf.addImage(imgData, "PNG", 0, 50, canvas.width, canvas.height - 50);
  
  pdf.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);
}

// Export full dashboard report to PDF
export async function exportDashboardToPDF(
  stats: {
    totalUsers: number;
    totalVolume: string;
    platformEarnings: string;
    activePackages: number;
  },
  revenueData: any[],
  userGrowthData: any[],
  packageDistribution: any[],
  transactionVolume: any[],
  mlmPerformance: any[],
  platformEarnings: any[],
  filename: string = "admin_dashboard_report"
) {
  const pdf = new jsPDF("portrait", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 40;
  
  // Header with logo and title
  pdf.setFillColor(139, 92, 246); // Purple gradient
  pdf.rect(0, 0, pageWidth, 80, "F");
  
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text("SUI24 Admin Dashboard Report", pageWidth / 2, 35, { align: "center" });
  
  pdf.setFontSize(12);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 60, { align: "center" });
  
  yPosition = 100;
  
  // Key Metrics Summary
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246);
  pdf.text("📊 Key Metrics", 40, yPosition);
  yPosition += 30;
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  const metrics = [
    [`Total Users`, stats.totalUsers.toLocaleString()],
    [`Total Volume`, stats.totalVolume],
    [`Platform Earnings`, stats.platformEarnings],
    [`Active Packages`, stats.activePackages.toLocaleString()],
  ];
  
  autoTable(pdf, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: metrics,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 40, right: 40 },
  });
  
  yPosition = (pdf as any).lastAutoTable.finalY + 30;
  
  // Revenue Analytics Table
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 40;
  }
  
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246);
  pdf.text("💰 Revenue Analytics (Last 7 Days)", 40, yPosition);
  yPosition += 20;
  
  const revenueTableData = revenueData.map(item => [
    item.date,
    `$${item.deposits.toLocaleString()}`,
    `$${item.withdrawals.toLocaleString()}`,
    `$${item.net.toLocaleString()}`,
    `$${item.adminFees.toLocaleString()}`,
  ]);
  
  autoTable(pdf, {
    startY: yPosition,
    head: [["Date", "Deposits", "Withdrawals", "Net Revenue", "Admin Fees"]],
    body: revenueTableData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 40, right: 40 },
  });
  
  yPosition = (pdf as any).lastAutoTable.finalY + 30;
  
  // Package Distribution
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 40;
  }
  
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246);
  pdf.text("📦 Package Distribution", 40, yPosition);
  yPosition += 20;
  
  const packageTableData = packageDistribution.map(item => [
    item.name,
    item.users.toString(),
    `${item.percentage}%`,
  ]);
  
  autoTable(pdf, {
    startY: yPosition,
    head: [["Package", "Users", "Percentage"]],
    body: packageTableData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 40, right: 40 },
  });
  
  yPosition = (pdf as any).lastAutoTable.finalY + 30;
  
  // Transaction Volume
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 40;
  }
  
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246);
  pdf.text("💸 Transaction Volume", 40, yPosition);
  yPosition += 20;
  
  const transactionTableData = transactionVolume.map(item => [
    item.type,
    item.count.toString(),
    `$${item.volume.toLocaleString()}`,
    `$${item.avg.toLocaleString()}`,
  ]);
  
  autoTable(pdf, {
    startY: yPosition,
    head: [["Type", "Count", "Volume", "Avg"]],
    body: transactionTableData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 40, right: 40 },
  });
  
  yPosition = (pdf as any).lastAutoTable.finalY + 30;
  
  // MLM Performance
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 40;
  }
  
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246);
  pdf.text("🌳 MLM Performance (24 Levels)", 40, yPosition);
  yPosition += 20;
  
  const mlmTableData = mlmPerformance.map(item => [
    item.level,
    item.users.toLocaleString(),
    `$${item.volume.toLocaleString()}`,
    `$${item.commission.toLocaleString()}`,
    `${item.rate}%`,
  ]);
  
  autoTable(pdf, {
    startY: yPosition,
    head: [["Level", "Users", "Volume", "Commission", "Rate"]],
    body: mlmTableData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 40, right: 40 },
    styles: { fontSize: 9 }, // Smaller font for 24 levels
  });
  
  yPosition = (pdf as any).lastAutoTable.finalY + 30;
  
  // Platform Earnings Breakdown
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 40;
  }
  
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246);
  pdf.text("💎 Platform Earnings Breakdown", 40, yPosition);
  yPosition += 20;
  
  const earningsTableData = platformEarnings.map(item => [
    item.name,
    `$${item.value.toLocaleString()}`,
    `${item.percentage}%`,
  ]);
  
  autoTable(pdf, {
    startY: yPosition,
    head: [["Source", "Amount", "Percentage"]],
    body: earningsTableData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 40, right: 40 },
  });
  
  // Footer
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${pageCount} | SUI24.trade - Confidential`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
  }
  
  pdf.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);
}

// Export table data to CSV
export function exportTableToCSV(
  data: any[],
  headers: string[],
  filename: string
) {
  const csv = Papa.unparse({ fields: headers, data });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}