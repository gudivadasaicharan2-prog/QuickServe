package com.quickserve.backend.service;

import com.quickserve.backend.dto.MenuItemRequest;
import com.quickserve.backend.dto.MenuItemResponse;

import java.util.List;

public interface MenuItemService {

    /**
     * Returns all menu items sorted A → Z by name.
     */
    List<MenuItemResponse> getAllMenuItems();

    /**
     * Returns a single menu item by ID.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    MenuItemResponse getMenuItemById(Long id);

    /**
     * Returns all menu items belonging to the given category.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if the category does not exist
     */
    List<MenuItemResponse> getMenuItemsByCategoryId(Long categoryId);

    /**
     * Returns only menu items whose {@code available} flag is {@code true}.
     */
    List<MenuItemResponse> getAvailableMenuItems();

    /**
     * Creates a new menu item.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException  if the category does not exist
     * @throws com.quickserve.backend.exception.DuplicateResourceException if a menu item with the same name already exists
     */
    MenuItemResponse createMenuItem(MenuItemRequest request);

    /**
     * Replaces all fields of an existing menu item.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException  if the item or category does not exist
     * @throws com.quickserve.backend.exception.DuplicateResourceException if the new name conflicts with another item
     */
    MenuItemResponse updateMenuItem(Long id, MenuItemRequest request);

    /**
     * Flips the {@code available} flag of a menu item (true → false, false → true).
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    MenuItemResponse toggleAvailability(Long id);

    /**
     * Permanently removes a menu item.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    void deleteMenuItem(Long id);
}
