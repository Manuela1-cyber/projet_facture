package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Frontend frontend = new Frontend();
    private Mail mail = new Mail();

    public Frontend getFrontend() {
        return frontend;
    }

    public void setFrontend(Frontend frontend) {
        this.frontend = frontend;
    }

    public Mail getMail() {
        return mail;
    }

    public void setMail(Mail mail) {
        this.mail = mail;
    }

    public static class Frontend {
        private String url = "http://localhost:3000";

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class Mail {
        private String from = "contact@tondomaine.com";
        private String fromName = "Easy";

        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }

        public String getFromName() {
            return fromName;
        }

        public void setFromName(String fromName) {
            this.fromName = fromName;
        }
    }
}
