package com.swe3.tms.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.swe3.tms.model.Account;
import com.swe3.tms.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CookieService cookieService;

    public boolean authUser(String username, String password, HttpServletRequest req, HttpServletResponse res) throws UsernameNotFoundException {

        if (username.isEmpty() || password.isEmpty()) {
            return false;
        }

        Optional<Account> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            Account user = userOpt.get();
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            if (encoder.matches(password, user.getPassword())) {
                cookieService.createCookie(username, req, res);
                return true;
            }
        }
        return false; //User not found
    }

    public Account createUser(String username, String password, String email, int isActive) {
        Account user = new Account();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        user.setIsActive(isActive);
        return userRepository.save(user);
    }
}
