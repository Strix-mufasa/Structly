import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Structly <noreply@structly.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendInviteEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/set-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: "You're invited to Structly",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8f9ff;">
        <div style="background: #0f1117; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Structly</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0;">Time Registration</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #0f1117; font-size: 20px; margin: 0 0 12px;">Hi ${name},</h2>
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
            You've been invited to Structly. Click the button below to set your password and activate your account.
          </p>
          <a href="${link}" style="display: inline-block; background: #4361EE; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Set up your account →
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">
            This link expires in 48 hours. If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Structly password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8f9ff;">
        <div style="background: #0f1117; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Structly</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #0f1117; font-size: 20px; margin: 0 0 12px;">Reset your password</h2>
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
            Hi ${name}, we received a request to reset your password. Click below to choose a new one.
          </p>
          <a href="${link}" style="display: inline-block; background: #4361EE; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Reset password →
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    `,
  })
}
