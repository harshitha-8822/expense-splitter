package com.splitter.dto;

import lombok.Data;
import java.util.List;

@Data
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private List<MemberResponse> members;

    @Data
    public static class MemberResponse {
        private Long id;
        private String name;
        private String email;
    }
}