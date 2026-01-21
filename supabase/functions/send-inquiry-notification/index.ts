import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryNotificationRequest {
  name: string;
  company: string;
  website?: string;
  phone: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received inquiry notification request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, company, website, phone, message }: InquiryNotificationRequest = await req.json();
    
    console.log("Processing inquiry from:", { name, company, phone });

    // 构建邮件内容
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          🔔 新的咨询请求
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold; width: 120px;">
              姓名
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              ${name}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">
              公司
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              ${company}
            </td>
          </tr>
          ${website ? `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">
              企业官网
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              <a href="${website}" target="_blank" style="color: #007bff;">${website}</a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">
              联系电话
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              ${phone}
            </td>
          </tr>
          ${message ? `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold; vertical-align: top;">
              咨询内容
            </td>
            <td style="padding: 12px; border: 1px solid #ddd; white-space: pre-wrap;">
              ${message}
            </td>
          </tr>
          ` : ''}
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            📅 提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
          </p>
        </div>
        
        <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
          此邮件由智脑时代 GEO 系统自动发送
        </p>
      </div>
    `;

    // 使用 Resend API 发送邮件
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "智脑时代 <onboarding@resend.dev>",
        to: ["93510890@qq.com"],
        subject: `[新咨询] ${company} - ${name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-inquiry-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
