"use server"

import * as XLSX from "xlsx"
import nodemailer from "nodemailer"

export async function submitWishlist(wishlist: any) {
  try {
    // Create Excel file
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(wishlist.items)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wishlist")
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Create email transporter
    const smtpConfig = {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }

    const transporter = nodemailer.createTransport(smtpConfig)

    // Verify SMTP connection
    try {
      await transporter.verify()
    } catch (verifyError: unknown) {
      console.error("SMTP verification failed:", verifyError)
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Unknown error occurred'
      throw new Error(`SMTP verification failed: ${errorMessage}`)
    }

    // Create email content with all user details
    const emailText = `
A new wishlist has been submitted with the following details:

User Information:
----------------
Name: ${wishlist.userDetails.name}
Email: ${wishlist.userDetails.email}
Phone: ${wishlist.userDetails.phone}
Address: ${wishlist.userDetails.address}

Number of items in wishlist: ${wishlist.items.length}

Please find the complete wishlist attached as an Excel file.
`

    // Send email
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: "New Wishlist Submission",
      text: emailText,
      attachments: [
        {
          filename: "wishlist.xlsx",
          content: excelBuffer,
        },
      ],
    })

    return { success: true, message: "Wishlist submitted successfully!" }
  } catch (error: unknown) {
    console.error("Error in submitWishlist:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { success: false, message: `Failed to submit wishlist: ${errorMessage}` }
  }
}

