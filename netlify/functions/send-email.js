const nodemailer = require('nodemailer');

// Configuración de Gmail SMTP
const GMAIL_USER = 'jdriverac08@gmail.com';
const GMAIL_APP_PASSWORD = 'rukg pigd vvbj lvyf';

exports.handler = async (event, context) => {
    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parsear datos del email
        const { to, subject, html, type, tareaId, usuarioId } = JSON.parse(event.body);

        // Validar datos requeridos
        if (!to || !subject || !html) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields: to, subject, html' })
            };
        }

        // Crear transporter con Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD
            }
        });

        // Configurar email
        const mailOptions = {
            from: `TaskManager Pro <${GMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
            replyTo: GMAIL_USER
        };

        // Enviar email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email enviado:', info.messageId);

        // Respuesta exitosa
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                messageId: info.messageId,
                type: type,
                tareaId: tareaId,
                usuarioId: usuarioId
            })
        };

    } catch (error) {
        console.error('Error enviando email:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};