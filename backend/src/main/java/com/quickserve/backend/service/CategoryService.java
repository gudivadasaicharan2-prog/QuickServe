package com.quickserve.backend.service;

import com.quickserve.backend.dto.CategoryRequest;
import com.quickserve.backend.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    /**
     * Returns all categories ordered by name ascending.
     */
    List<CategoryResponse> getAllCategories();

    /**
     * Returns a single category by its ID.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    CategoryResponse getCategoryById(Long id);

    /**
     * Creates a new category.
     *
     * @throws com.quickserve.backend.exception.DuplicateResourceException if a category
     *         with the same name (case-insensitive) already exists
     */
    CategoryResponse createCategory(CategoryRequest request);

    /**
     * Updates an existing category.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     * @throws com.quickserve.backend.exception.DuplicateResourceException if the new name
     *         conflicts with another existing category
     */
    CategoryResponse updateCategory(Long id, CategoryRequest request);

    /**
     * Deletes a category by ID.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    void deleteCategory(Long id);
}
