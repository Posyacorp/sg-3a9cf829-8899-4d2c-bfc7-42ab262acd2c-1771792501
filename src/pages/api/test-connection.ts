import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        details: testError.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      });
    }

    // Test admin account
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'admin@sui24.trade')
      .single();

    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful!',
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      admin: {
        exists: !!adminData,
        email: adminData?.email,
        role: adminData?.role,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message,
    });
  }
}