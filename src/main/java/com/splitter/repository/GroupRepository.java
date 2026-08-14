package com.splitter.repository;

import com.splitter.model.Group;
import com.splitter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Find all groups where this user is a member
    List<Group> findByMembersUser(User user);
}