package com.example.demo.service;

import com.example.demo.model.Facture;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
//import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter
            .ofPattern("dd MMMM yyyy 'à' HH'h'mm", Locale.FRENCH)
            .withZone(ZoneId.systemDefault());

    @Autowired
    private JavaMailSender emailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mail.from:contact@tondomaine.com}")
    private String mailFrom;

    @Value("${app.mail.from-name:Easy}")
    private String mailFromName;

    /**
     * Envoi synchrone (peut bloquer la requête HTTP en cas de lenteur SMTP).
     */
    public void sendEmail(String to, String subject, String text)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(mailFrom, mailFromName);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        emailSender.send(message);
    }

    @Async
    public void sendVerificationEmailAsync(String to, String subject, String htmlMessage) {
        try {
            sendEmail(to, subject, htmlMessage);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error(
                    "Envoi email de vérification échoué pour {}: {}",
                    to, e.getMessage(), e);
        }
    }

    @Async
    public void sendFactureConfirmationEmail(String to, Facture facture) {
        if (to == null || to.isBlank()) {
            return;
        }
        try {
            String locataireId = facture.getAssigner().getLocataire().getId().toString();
            String paymentLink = buildPaymentLink(locataireId, facture.getId());
            String html = buildFactureConfirmationHtml(facture, paymentLink);
            String subject = "Paiement de votre facture #" + facture.getId().toString().substring(0, 8);
            sendEmail(to, subject, html);
            log.info("Email de paiement de facture envoyé à {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Envoi email de paiement de facture échoué pour {}: {}", to, e.getMessage(), e);
        }
    }

    public String buildPaymentLink(String locataireId, java.util.UUID factureId) {
        String base = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
        return base + "espace-locataire/" + locataireId + "?factureId=" + factureId.toString();
    }

    public String buildFactureConfirmationHtml(Facture facture, String paymentLink) {
        String factureIdShort = facture.getId().toString().substring(0, 8);
        String dateStr = facture.getCreatedAt() != null ? DATE_FORMAT.format(facture.getCreatedAt()) : "";

        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Facturation Mensuelle</title>
                </head>
                <body style="margin:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f5;">
                  <div style="max-width:560px;margin:0 auto;padding:24px;">
                    <div style="background-color:#8352A5;border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
                      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">Paiement de votre facture</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Merci pour votre confiance</p>
                    </div>
                    <div style="background:#fff;border-radius:0 0 12px 12px;padding:24px;box-shadow:0 4px 6px #8352A5;">
                      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Bonjour,</p>
                      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.5;">Votre facture est déjà disponible. Voici le lien pour effectuer le paiement.</p>
                      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">N° facture</p>
                        <p style="margin:0;font-size:18px;font-weight:600;color:#1e3a5f;">#%s</p>
                        <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Date</p>
                        <p style="margin:0;font-size:14px;color:#374151;">%s</p>
                      </div>
                      <div style="margin-top:24px;text-align:center;">
                        <a href="%s" style="display:inline-block;background-color:#8352A5;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Payer cette facture</a>
                      </div>
                      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">Si le bouton ne s'affiche pas, copiez ce lien : %s</p>
                    </div>
                    <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#94a3b8;">Easy — Paiement de facture</p>
                  </div>
                </body>
                </html>
                """
                .formatted(
                        escapeFormatPercent(factureIdShort),
                        escapeFormatPercent(dateStr),
                        escapeFormatPercent(paymentLink),
                        escapeFormatPercent(paymentLink));
    }

    /*
     * private static String formatPrice(float price) {
     * return String.format(Locale.FRENCH, "%.0f FCFA", price);
     * }
     */

    /*
     * private static String escapeHtml(String s) {
     * if (s == null)
     * return "";
     * return s.replace("&", "&amp;").replace("<", "&lt;").replace(">",
     * "&gt;").replace("\"", "&quot;");
     * }
     */

    /**
     * Échappe % pour éviter que .formatted() interprète des séquences comme %d, %#
     * etc. dans le contenu.
     */
    private static String escapeFormatPercent(String s) {
        if (s == null)
            return "";
        return s.replace("%", "%%");
    }
}