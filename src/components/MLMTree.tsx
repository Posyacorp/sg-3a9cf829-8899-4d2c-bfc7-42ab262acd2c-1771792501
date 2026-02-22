import { useState } from "react";
import { Users, ChevronDown, ChevronRight, Package, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TreeNode {
  id: string;
  username: string;
  level: number;
  investment: number;
  roi: number;
  package: string;
  status: "active" | "inactive";
  children: TreeNode[];
}

interface MLMTreeProps {
  rootNode: TreeNode;
}

function TreeNodeComponent({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative">
      <div 
        className="flex items-start gap-2 mb-2"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {node.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-purple-400 hover:text-purple-300"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        
        <div className="relative flex-1">
          <div className="flex items-center gap-2 p-2 bg-slate-900/50 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold text-sm">{node.username}</span>
            <Badge className={
              node.status === "active" 
                ? "bg-green-500/20 text-green-400 text-xs" 
                : "bg-gray-500/20 text-gray-400 text-xs"
            }>
              L{node.level}
            </Badge>
          </div>

          {/* Hover Details Popup */}
          {showDetails && (
            <Card className="absolute left-0 top-full mt-2 p-4 bg-slate-950 border-purple-500/30 backdrop-blur-xl z-10 min-w-64 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{node.username}</span>
                  <Badge className="bg-purple-500/20 text-purple-300">
                    Level {node.level}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Package:</span>
                    <span className="text-white font-semibold">{node.package}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investment:</span>
                    <span className="text-green-400 font-semibold">{node.investment} SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total ROI:</span>
                    <span className="text-purple-400 font-semibold">{node.roi.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className={
                      node.status === "active" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-gray-500/20 text-gray-400"
                    }>
                      {node.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Direct Referrals:</span>
                    <span className="text-white font-semibold">{node.children.length}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {isExpanded && node.children.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-purple-500/20 space-y-2">
          {node.children.map((child) => (
            <TreeNodeComponent key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MLMTree({ rootNode }: MLMTreeProps) {
  return (
    <div className="p-6 bg-slate-900/50 border border-purple-500/20 rounded-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h3 className="text-xl font-black text-white">MLM Network Tree</h3>
      </div>
      <TreeNodeComponent node={rootNode} />
    </div>
  );
}