package com.splitter.controller;

import com.splitter.dto.GroupRequest;
import com.splitter.dto.GroupResponse;
import com.splitter.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // POST /api/groups — create a group
    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody GroupRequest request) {
        return ResponseEntity.ok(groupService.createGroup(request));
    }

    // POST /api/groups/{id}/members — add member by email
    @PostMapping("/{id}/members")
    public ResponseEntity<GroupResponse> addMember(
            @PathVariable Long id,
            @RequestParam String email) {
        return ResponseEntity.ok(groupService.addMember(id, email));
    }

    // GET /api/groups — get all my groups
    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    // GET /api/groups/{id} — get one group
    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroupById(
            @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }
}