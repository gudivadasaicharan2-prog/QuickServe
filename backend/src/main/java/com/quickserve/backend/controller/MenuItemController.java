package com.quickserve.backend.controller;

import com.quickserve.backend.dto.MenuItemRequest;
import com.quickserve.backend.dto.MenuItemResponse;
import com.quickserve.backend.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    /**
     * GET /api/menu
     * Returns all menu items sorted by name A→Z.
     */
    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }

    /**
     * GET /api/menu/available
     * Returns only available menu items.
     */
    @GetMapping("/available")
    public ResponseEntity<List<MenuItemResponse>> getAvailableMenuItems() {
        return ResponseEntity.ok(menuItemService.getAvailableMenuItems());
    }

    /**
     * GET /api/menu/category/{categoryId}
     * Returns all menu items in a specific category.
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(menuItemService.getMenuItemsByCategoryId(categoryId));
    }

    /**
     * GET /api/menu/{id}
     * Returns a single menu item by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.getMenuItemById(id));
    }

    /**
     * POST /api/menu
     * Creates a new menu item.
     */
    @PostMapping
    public ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse created = menuItemService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/menu/{id}
     * Replaces an existing menu item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuItemService.updateMenuItem(id, request));
    }

    /**
     * PATCH /api/menu/{id}/availability
     * Toggles the available status of a menu item.
     */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<MenuItemResponse> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.toggleAvailability(id));
    }

    /**
     * DELETE /api/menu/{id}
     * Deletes a menu item.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
