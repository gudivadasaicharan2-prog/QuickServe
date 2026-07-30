package com.quickserve.backend.service.impl;

import com.quickserve.backend.dto.MenuItemRequest;
import com.quickserve.backend.dto.MenuItemResponse;
import com.quickserve.backend.entity.Category;
import com.quickserve.backend.entity.MenuItem;
import com.quickserve.backend.exception.DuplicateResourceException;
import com.quickserve.backend.exception.ResourceNotFoundException;
import com.quickserve.backend.repository.CategoryRepository;
import com.quickserve.backend.repository.MenuItemRepository;
import com.quickserve.backend.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    // ── Read operations ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem item = findOrThrow(id);
        return toResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItemsByCategoryId(Long categoryId) {
        // First verify category exists to give a clear 404 rather than an empty list
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", categoryId);
        }
        return menuItemRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Write operations ─────────────────────────────────────────────────────────

    @Override
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        if (menuItemRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("MenuItem", "name", request.getName());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        MenuItem item = MenuItem.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null)
                .available(request.getAvailable() == null ? true : request.getAvailable())
                .category(category)
                .build();

        return toResponse(menuItemRepository.save(item));
    }

    @Override
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = findOrThrow(id);

        if (menuItemRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("MenuItem", "name", request.getName());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        item.setName(request.getName().trim());
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null);
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        item.setCategory(category);

        return toResponse(menuItemRepository.save(item));
    }

    @Override
    public MenuItemResponse toggleAvailability(Long id) {
        MenuItem item = findOrThrow(id);
        item.setAvailable(!item.isAvailable());
        return toResponse(menuItemRepository.save(item));
    }

    @Override
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("MenuItem", id);
        }
        menuItemRepository.deleteById(id);
    }

    // ── Private helpers ───────────────────────────────────────────────────────────

    private MenuItem findOrThrow(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", id));
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .available(item.isAvailable())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
