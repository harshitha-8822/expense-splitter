package com.splitter.service;

import com.splitter.dto.GroupRequest;
import com.splitter.dto.GroupResponse;
import com.splitter.model.Group;
import com.splitter.model.GroupMember;
import com.splitter.model.User;
import com.splitter.repository.GroupMemberRepository;
import com.splitter.repository.GroupRepository;
import com.splitter.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository,
                        GroupMemberRepository groupMemberRepository,
                        UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    // ── Get currently logged in user ──────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Create a new group ────────────────────────────────────────
    public GroupResponse createGroup(GroupRequest request) {

        User currentUser = getCurrentUser();

        // Create group
        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        groupRepository.save(group);

        // Auto-add creator as first member
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(currentUser);
        groupMemberRepository.save(member);

        return mapToResponse(group);
    }

    // ── Add a member to group ─────────────────────────────────────
    public GroupResponse addMember(Long groupId, String email) {

        // Find group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Find user to add
        User userToAdd = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with email: " + email));

        // Check if already a member
        if (groupMemberRepository.existsByGroupAndUser(group, userToAdd)) {
            throw new RuntimeException("User is already a member");
        }

        // Add member
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(userToAdd);
        groupMemberRepository.save(member);

        return mapToResponse(group);
    }

    // ── Get all groups for current user ───────────────────────────
    public List<GroupResponse> getMyGroups() {
        User currentUser = getCurrentUser();
        List<Group> groups = groupRepository.findByMembersUser(currentUser);
        return groups.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Get one group by id ───────────────────────────────────────
    public GroupResponse getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return mapToResponse(group);
    }

    // ── Convert Group entity to GroupResponse DTO ─────────────────
    private GroupResponse mapToResponse(Group group) {

        GroupResponse response = new GroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setDescription(group.getDescription());

        // Map each GroupMember to MemberResponse
        List<GroupResponse.MemberResponse> members = group.getMembers()
                .stream()
                .map(gm -> {
                    GroupResponse.MemberResponse mr =
                            new GroupResponse.MemberResponse();
                    mr.setId(gm.getUser().getId());
                    mr.setName(gm.getUser().getName());
                    mr.setEmail(gm.getUser().getEmail());
                    return mr;
                })
                .collect(Collectors.toList());

        response.setMembers(members);
        return response;
    }
}