"use server"

import * as XLSX from "xlsx"
import nodemailer from "nodemailer"

export async function submitOrder(orderDetails: any) {
  try {
    // Create Excel file with order details
    const workbook = XLSX.utils.book_new()
    // Format items for Excel
    const items = orderDetails.cart.map((item: any) => ({
      "Item Name": item.name,
      "Quantity": item.quantity,
      "Price": item.price,
      "Total": item.price * item.quantity,
      ...(item.specialData && {
        "Special Data": JSON.stringify(item.specialData)
      })
    }))
    const worksheet = XLSX.utils.json_to_sheet(items)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order")
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

    // Calculate total order amount
    const totalAmount = orderDetails.cart.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity)
    }, 0)

    // Create email content with all order details
    const emailText = `
A new order has been submitted with the following details:

Customer Information:
-------------------
Name: ${orderDetails.name}
Email: ${orderDetails.email}
Phone: ${orderDetails.phone}
Delivery Address: ${orderDetails.address}
Preferred Contact Method: ${orderDetails.preferredContact}
Order Date: ${new Date(orderDetails.orderDate).toLocaleString()}

Order Summary:
-------------
Total Items: ${orderDetails.cart.length}
Total Amount: $${totalAmount.toFixed(2)}

${orderDetails.feedback ? `Customer Feedback:
----------------
${orderDetails.feedback}` : ''}

Please find the complete order details attached as an Excel file.
`

    // Send email to admin
    const adminEmailResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: "New Order Submission",
      text: emailText,
      attachments: [
        {
          filename: "order.xlsx",
          content: excelBuffer,
        },
      ],
    })

    // Send confirmation email to customer
//     const customerEmailResult = await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to: orderDetails.email,
//       subject: "Order Confirmation - Thank You for Your Order",
//       text: `
// Dear Customer,

// Thank you for your order! We have received your order details and will process it shortly.

// Order Summary:
// -------------
// Total Items: ${orderDetails.cart.length}
// Total Amount: $${totalAmount.toFixed(2)}

// Our team will review your order and reach out to you soon with the delivery date.

// If you have any questions, please don't hesitate to contact us.

// Best regards,
// Your Store Team
// `,
//     })

    return { success: true, message: "Order submitted successfully!" }
  } catch (error: unknown) {
    console.error("Error in submitOrder:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { success: false, message: `Failed to submit order: ${errorMessage}` }
  }
} 