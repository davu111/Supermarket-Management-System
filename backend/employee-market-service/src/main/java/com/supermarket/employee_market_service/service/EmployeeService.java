package com.supermarket.employee_market_service.service;


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

        // Create user
        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        String[] names = employee.getName().split(" ", 2);
        user.setFirstName(names[0]);
        user.setLastName(names.length > 1 ? names[1] : "");
        user.setEmail(employee.getEmail());
        user.setUsername(employee.getEmail());
        user.setEmailVerified(true);

        // Set temporary password
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue("TempPassword123!"); // Should be changed on first login
        credential.setTemporary(true);
        user.setCredentials(Collections.singletonList(credential));

        Response response = usersResource.create(user);

        if (response.getStatus() == 201) {
            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

            // Assign role
            if (employee.getRole() != null && !employee.getRole().isEmpty()) {
                assignRole(realmResource, userId, employee.getRole());
            }

            employee.setId(userId);
            response.close();
            return employee;
        } else {
            response.close();
            throw new RuntimeException("Failed to create user: " + response.getStatusInfo());
        }
    }

    public Employee updateEmployee(String userId, Employee employee) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(userId);
        UserRepresentation user = userResource.toRepresentation();

        // Update user info
        String[] names = employee.getName().split(" ", 2);
        user.setFirstName(names[0]);
        user.setLastName(names.length > 1 ? names[1] : "");
        user.setEmail(employee.getEmail());
        user.setUsername(employee.getEmail());

        userResource.update(user);

        // Update role if changed
        String currentRole = getUserRole(realmResource, userId);
        if (!currentRole.equals(employee.getRole())) {
            updateUserRole(realmResource, userId, currentRole, employee.getRole());
        }

        return employee;
    }

    public void deleteEmployee(String userId) {
        RealmResource realmResource = keycloak.realm(realm);
        realmResource.users().delete(userId);
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

    private void assignRole(RealmResource realmResource, String userId, String roleName) {
        if (!VALID_ROLES.contains(roleName)) {
            throw new IllegalArgumentException("Invalid role: " + roleName);
        }

        UserResource userResource = realmResource.users().get(userId);
        RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(role));
    }

    private void updateUserRole(RealmResource realmResource, String userId, String oldRole, String newRole) {
        if (!VALID_ROLES.contains(newRole)) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }

        UserResource userResource = realmResource.users().get(userId);

        // Remove old role if it exists and is valid
        if (VALID_ROLES.contains(oldRole)) {
            RoleRepresentation oldRoleRep = realmResource.roles().get(oldRole).toRepresentation();
            userResource.roles().realmLevel().remove(Collections.singletonList(oldRoleRep));
        }

        // Add new role
        RoleRepresentation newRoleRep = realmResource.roles().get(newRole).toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(newRoleRep));
    }
}
