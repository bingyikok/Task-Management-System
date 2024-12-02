package com.swe3.tms.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import com.swe3.tms.model.*;
import com.swe3.tms.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/auth/login")
    public ResponseEntity<Response> login(@RequestBody Map<String, String> reqBody, HttpServletRequest req, HttpServletResponse res) {
        // Logic for login
        String username = reqBody.get("username");
        String password = reqBody.get("password");

        boolean isAuthenticated = userService.authUser(username, password, req, res);

        if (isAuthenticated) {
            Response response = new Response(true, "Valid credentials");
            return ResponseEntity.ok(response);
        } else {
            Response response = new Response(false, "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/token")
    public CsrfToken getCsrfToken(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute("_csrf");
    }
    

    @GetMapping("/logout")
    public ResponseEntity<String> logout() {
        // Logic for logout
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/session")
    public ResponseEntity<Response> verifySession() {
        // Logic for verifying session
        // return ResponseEntity.ok().header("Content-Type", "application/json").body("Session verified");

        Response response = new Response(true, "Session verified");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change")
    public ResponseEntity<String> updateProfile(@RequestBody Account updateProfileRequest) {
        // Logic for updating profile
        return ResponseEntity.ok("Profile updated");
    }

    @GetMapping("/users")
    public ResponseEntity<String> loadUsers() {
        return ResponseEntity.ok("Users loaded");
    }

    @GetMapping("/groups")
    public ResponseEntity<String> loadGroups() {
        // Logic for updating profile
        return ResponseEntity.ok("Groups loaded");
    }

    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody Account createUserRequest) {
        // Logic for verifying session
        return ResponseEntity.ok("User created");
    }

    @PostMapping("/creategroup")
    public ResponseEntity<String> createGroup(@RequestBody UserGroup createGroupRequest) {
        return ResponseEntity.ok("Group created");
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody UserGroup updateUser) {
        return ResponseEntity.ok("User updated");
    }
}

// import org.springframework.stereotype.Controller;
// import org.springframework.web.bind.annotation.ResponseBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestMethod;


// @Controller
// @RequestMapping("/hello")
// public class AuthController {

//     @ResponseBody
//     @RequestMapping(value = "", method=RequestMethod.GET)
//     public String hello() {
//         return "hello world";
//     }
// }