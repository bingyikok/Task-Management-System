package com.swe3.tms.service;

import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class JwtService {
    private String jwtSecret;

    public String generateToken(String username, HttpServletRequest req) {

        String ipAddress = req.getHeader("x-forwarded-for");

        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = req.getRemoteAddr(); //Return ip of last req
        }

        String browserInfo = req.getHeader("User-Agent");

        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("ip" ,ipAddress);
        claims.put("browser", browserInfo);
        System.out.println(claims);
        return Jwts.builder()
            .header().add("typ", "JWT").and()
            .claims()
            .add(claims)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)) //Token expiration
            .and()
            .signWith(getKey()) // Sign with SHA256
            .compact();
    }

    public JwtService() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
            SecretKey secretKey = keyGen.generateKey();
            jwtSecret = Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (NoSuchAlgorithmException err) {
            throw new RuntimeException(err);
        }
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
