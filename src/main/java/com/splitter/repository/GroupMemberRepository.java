package com.splitter.repository;

import com.splitter.model.Group;
import com.splitter.model.GroupMember;
import com.splitter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    // Check if user is already in a group
    boolean existsByGroupAndUser(Group group, User user);

    // Find a specific membership
    Optional<GroupMember> findByGroupAndUser(Group group, User user);
}