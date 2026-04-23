package com.example.demo.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "security.jwt")
@Getter
@Setter

public class JwtProperties {

    private String secretKey;
    private Long expirationTime;
}