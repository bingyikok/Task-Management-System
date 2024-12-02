package com.swe3.tms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity 
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(customizer -> customizer.disable()) //Disable Cross-site Req Forgery protection
            .authorizeHttpRequests(request -> request
            .requestMatchers("/**").permitAll() //Permit all api request
            .anyRequest().authenticated()) //Require authentication for all req
            // .formLogin(Customizer.withDefaults()) //Login popup for browser
            // .httpBasic(Customizer.withDefaults()) //Login authorisation header for postman
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) //Server will not store session state
            .build();
    }

    // @Bean
    // public UserDetailsService userDetailsService(){
    //     UserDetails user = User
    //         .withDefaultPasswordEncoder()
    //         .username("bing")
    //         .password("bing")
    //         .build();

    //     return new InMemoryUserDetailsManager(user);
    // }

    // @Bean
    // public AuthenticationProvider authenticationProvider() {
    //     DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    //     provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
    //     return provider;
    // }
}
