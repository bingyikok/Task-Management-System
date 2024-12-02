package com.swe3.tms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.swe3.tms.model.Account;

@Repository
public interface UserRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUsername(String username);
}