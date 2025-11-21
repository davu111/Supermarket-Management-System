package com.supermarket.employee_market_service.service;


import com.supermarket.employee_market_service.dto.response.EmployeeCredentials;
import com.supermarket.employee_market_service.exception.*;
import com.supermarket.employee_market_service.model.Employee;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.AbstractMap;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    private static final List<String> VALID_ROLES = Arrays.asList("CASHIER", "WAREHOUSE", "MARKETING", "ADMIN");

    public List<Employee> getAllEmployees() {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        return usersResource.list().stream()
                .map(user -> {
                    String role = getUserRole(realmResource, user.getId());
                    return new AbstractMap.SimpleEntry<>(user, role);
                })
                .filter(entry -> !"ADMIN".equalsIgnoreCase(entry.getValue()))
                .map(entry -> {
                    UserRepresentation user = entry.getKey();
                    String role = entry.getValue();
                    return new Employee(
                            user.getId(),
                            user.getFirstName() + " " + user.getLastName(),
                            user.getEmail(),
                            role,
                            user.isEnabled()
                    );
                })
                .collect(Collectors.toList());
    }


    public Employee getEmployeeById(String userId) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(userId);
        UserRepresentation user = userResource.toRepresentation();

        String role = getUserRole(realmResource, userId);

        return new Employee(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                role,
                user.isEnabled()
        );
    }

    public Employee createEmployee(Employee employee) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        // Parse name
        String[] names = employee.getName().split(" ", 2);
        String firstName = names[0];
        String lastName = names.length > 1 ? names[1] : "";

        // Tạo username từ firstName (lowercase, không dấu)
        String username = removeVietnameseAccents(firstName.toLowerCase());

        // Check if username already exists
        List<UserRepresentation> existingUsers = usersResource.search(username, true);
        if (!existingUsers.isEmpty()) {
            throw new DuplicateUsernameException(username);
        }

        // Check if email already exists
        List<UserRepresentation> usersWithEmail = usersResource.search(null, null, null, employee.getEmail(), null, null);
        if (!usersWithEmail.isEmpty()) {
            throw new DuplicateEmailException(employee.getEmail());
        }

        // Create user
        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(employee.getEmail());
        user.setUsername(username);
        user.setEmailVerified(true);

        // Set password = firstName (không bắt buộc đổi)
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(firstName);
        credential.setTemporary(false);
        user.setCredentials(Collections.singletonList(credential));

        Response response = usersResource.create(user);

        try {
            if (response.getStatus() == 201) {
                String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

                // Assign role
                if (employee.getRole() != null && !employee.getRole().isEmpty()) {
                    assignRole(realmResource, userId, employee.getRole());
                }

                employee.setId(userId);

                // Store username in a custom attribute to retrieve later
                UserResource userResource = realmResource.users().get(userId);
                user = userResource.toRepresentation();
                user.singleAttribute("original_username", username);
                user.singleAttribute("original_password", firstName);
                userResource.update(user);

                return employee;
            } else if (response.getStatus() == 409) {
                throw new DuplicateUsernameException(username);
            } else {
                throw new EmployeeCreationException(response.getStatusInfo().getReasonPhrase());
            }
        } finally {
            response.close();
        }
    }

    public EmployeeCredentials getEmployeeCredentials(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            if (user == null) {
                throw new EmployeeNotFoundException(userId);
            }

            String role = getUserRole(realmResource, userId);
            String username = user.getAttributes() != null && user.getAttributes().containsKey("original_username")
                    ? user.getAttributes().get("original_username").get(0)
                    : user.getUsername();
            String password = user.getAttributes() != null && user.getAttributes().containsKey("original_password")
                    ? user.getAttributes().get("original_password").get(0)
                    : "********";

            return new EmployeeCredentials(
                    user.getId(),
                    user.getFirstName() + " " + user.getLastName(),
                    user.getEmail(),
                    role,
                    user.isEnabled(),
                    username,
                    password
            );
        } catch (jakarta.ws.rs.NotFoundException e) {
            throw new EmployeeNotFoundException(userId);
        }
    }

    public Employee updateEmployee(String userId, Employee employee) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            if (user == null) {
                throw new EmployeeNotFoundException(userId);
            }

            // Check if email is being changed and if new email already exists
            if (!user.getEmail().equals(employee.getEmail())) {
                UsersResource usersResource = realmResource.users();
                List<UserRepresentation> usersWithEmail = usersResource.search(null, null, null, employee.getEmail(), null, null);
                if (!usersWithEmail.isEmpty() && !usersWithEmail.get(0).getId().equals(userId)) {
                    throw new DuplicateEmailException(employee.getEmail());
                }
            }

            // Update user info
            String[] names = employee.getName().split(" ", 2);
            user.setFirstName(names[0]);
            user.setLastName(names.length > 1 ? names[1] : "");
            user.setEmail(employee.getEmail());

            userResource.update(user);

            // Update role if changed
            String currentRole = getUserRole(realmResource, userId);
            if (!currentRole.equals(employee.getRole())) {
                updateUserRole(realmResource, userId, currentRole, employee.getRole());
            }

            return employee;
        } catch (jakarta.ws.rs.NotFoundException e) {
            throw new EmployeeNotFoundException(userId);
        } catch (Exception e) {
            throw new EmployeeUpdateException(e.getMessage());
        }
    }

    public void deleteEmployee(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            realmResource.users().delete(userId);
        } catch (jakarta.ws.rs.NotFoundException e) {
            throw new EmployeeNotFoundException(userId);
        }
    }

    public EmployeeCredentials resetPassword(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            if (user == null) {
                throw new EmployeeNotFoundException(userId);
            }

            // Get firstName to use as new password
            String firstName = user.getFirstName();
            String username = user.getUsername();

            // Reset password to firstName
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(firstName);
            credential.setTemporary(false);

            userResource.resetPassword(credential);

            // Update stored password in attributes
            user.singleAttribute("original_password", firstName);
            userResource.update(user);

            // Return credentials
            String role = getUserRole(realmResource, userId);
            return new EmployeeCredentials(
                    user.getId(),
                    user.getFirstName() + " " + user.getLastName(),
                    user.getEmail(),
                    role,
                    user.isEnabled(),
                    username,
                    firstName
            );
        } catch (jakarta.ws.rs.NotFoundException e) {
            throw new EmployeeNotFoundException(userId);
        } catch (Exception e) {
            throw new PasswordResetException(e.getMessage());
        }
    }

    private void assignRole(RealmResource realmResource, String userId, String roleName) {
        if (!VALID_ROLES.contains(roleName)) {
            throw new InvalidRoleException(roleName);
        }

        try {
            UserResource userResource = realmResource.users().get(userId);
            RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
            userResource.roles().realmLevel().add(Collections.singletonList(role));
        } catch (Exception e) {
            throw new EmployeeServiceException("Không thể gán chức vụ: " + e.getMessage());
        }
    }

    private void updateUserRole(RealmResource realmResource, String userId, String oldRole, String newRole) {
        if (!VALID_ROLES.contains(newRole)) {
            throw new InvalidRoleException(newRole);
        }

        try {
            UserResource userResource = realmResource.users().get(userId);

            // Remove old role if it exists and is valid
            if (VALID_ROLES.contains(oldRole)) {
                RoleRepresentation oldRoleRep = realmResource.roles().get(oldRole).toRepresentation();
                userResource.roles().realmLevel().remove(Collections.singletonList(oldRoleRep));
            }

            // Add new role
            RoleRepresentation newRoleRep = realmResource.roles().get(newRole).toRepresentation();
            userResource.roles().realmLevel().add(Collections.singletonList(newRoleRep));
        } catch (Exception e) {
            throw new EmployeeServiceException("Không thể cập nhật chức vụ: " + e.getMessage());
        }
    }


    private String getUserRole(RealmResource realmResource, String userId) {
        UserResource userResource = realmResource.users().get(userId);
        List<RoleRepresentation> roles = userResource.roles().realmLevel().listEffective();

        for (RoleRepresentation role : roles) {
            if (VALID_ROLES.contains(role.getName())) {
                return role.getName();
            }
        }
        return "NONE";
    }

    // Hàm loại bỏ dấu tiếng Việt
    private String removeVietnameseAccents(String str) {
        String[][] accents = {
                {"à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ", "a"},
                {"è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ", "e"},
                {"ì|í|ị|ỉ|ĩ", "i"},
                {"ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ", "o"},
                {"ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ", "u"},
                {"ỳ|ý|ỵ|ỷ|ỹ", "y"},
                {"đ", "d"}
        };

        for (String[] accent : accents) {
            str = str.replaceAll(accent[0], accent[1]);
        }

        return str.replaceAll("[^a-z0-9]", "");
    }
}
