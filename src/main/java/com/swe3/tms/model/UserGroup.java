package com.swe3.tms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_groups")
public class UserGroup {
    @Id
    private String username;
    private String groupname;

    public UserGroup(String groupname, String username) {
        this.groupname = groupname;
        this.username = username;
    }

    // Getters and Setters
    public String getUsername() {
        return this.username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getGroupname() {
        return this.groupname;
    }

    public void setGroupname(String groupname) {
        this.groupname = groupname;
    }
}
