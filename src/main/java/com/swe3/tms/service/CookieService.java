package com.swe3.tms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class CookieService {
    @Autowired
    private JwtService jwtService;

    public void createCookie(String username, HttpServletRequest req, HttpServletResponse res) {
        String token = jwtService.generateToken(username, req);
        Cookie jwtCookie = new Cookie("token", token);
        jwtCookie.setMaxAge(7 * 24 * 60 * 60); //Cookie expiry 7days
        jwtCookie.setSecure(true); //Use HTTPS
        jwtCookie.setHttpOnly(true); //Prevent JS access
        jwtCookie.setPath("/"); //Cookie for all paths
        res.addCookie(jwtCookie);
        System.out.println(token);
    }
}
