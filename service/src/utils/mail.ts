import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'

import nodemailer from 'nodemailer'

import type { MailConfig } from '../storage/model'
import { getCacheConfig } from '../storage/config'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export async function sendVerifyMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  await sendMail(toMail, `${config.siteConfig.siteTitle} 賬號驗證`, mailHtml, config.mailConfig)
}

export async function sendVerifyMailAdmin(toMail: string, verifyName: string, verifyUrl: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.admin.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${TO_MAIL}/g, verifyName)
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  await sendMail(toMail, `${config.siteConfig.siteTitle} 賬號申請`, mailHtml, config.mailConfig)
}

export async function sendResetPasswordMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())
  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.resetpassword.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  await sendMail(toMail, `${config.siteConfig.siteTitle} 密碼重置`, mailHtml, config.mailConfig)
}

export async function sendNoticeMail(toMail: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.notice.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  await sendMail(toMail, `${config.siteConfig.siteTitle} 賬號開通`, mailHtml, config.mailConfig)
}

export async function sendTestMail(toMail: string, config: MailConfig) {
  await sendMail(toMail, '測試郵件|Test mail', '這是一封測試郵件|This is test mail', config)
}

async function sendMail(toMail: string, subject: string, html: string, config: MailConfig): Promise<void> {
  try {
    const mailOptions = {
      from: config.smtpFrom || config.smtpUserName,
      to: toMail,
      subject,
      html,
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpTsl,
      auth: {
        user: config.smtpUserName,
        pass: config.smtpPassword,
      },
    })
    await transporter.sendMail(mailOptions)
  }
  catch (e) {
    globalThis.console.error('Error send email, ', e)
  }
}
