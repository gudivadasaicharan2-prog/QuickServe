package com.quickserve.backend.config;

import com.quickserve.backend.entity.*;
import com.quickserve.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository        userRepository;
    private final CategoryRepository    categoryRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository    menuItemRepository;
    private final PasswordEncoder       passwordEncoder;

    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> {
            seedOwner();
            seedCategories();
            seedTables();
            seedMenuItems();
            log.info("=== QuickServe data seeding complete ===");
        };
    }

    // ── Owner ────────────────────────────────────────────────────────────────

    private void seedOwner() {
        if (userRepository.existsByUsername("admin")) {
            // Update password to ensure it matches the configured password
            userRepository.findByUsername("admin").ifPresent(owner -> {
                if (!passwordEncoder.matches("sai@2008", owner.getPassword())) {
                    owner.setPassword(passwordEncoder.encode("sai@2008"));
                    userRepository.save(owner);
                    log.info("[Seed] Owner password updated → username: admin");
                } else {
                    log.info("[Seed] Owner already exists — skipping.");
                }
            });
            return;
        }
        User owner = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("sai@2008"))
                .fullName("System Administrator")
                .role(Role.OWNER)
                .enabled(true)
                .build();
        userRepository.save(owner);
        log.info("[Seed] Owner created → username: admin");
    }

    // ── Categories ────────────────────────────────────────────────────────────

    private void seedCategories() {
        List<String> names = List.of("Starters", "Main Course", "Beverages", "Desserts");
        for (String name : names) {
            if (!categoryRepository.existsByNameIgnoreCase(name)) {
                Category category = Category.builder()
                        .name(name)
                        .description(name + " — demo category")
                        .build();
                categoryRepository.save(category);
                log.info("[Seed] Category created → {}", name);
            } else {
                log.info("[Seed] Category '{}' already exists — skipping.", name);
            }
        }
    }

    // ── Restaurant Tables ─────────────────────────────────────────────────────

    private void seedTables() {
        for (int i = 1; i <= 20; i++) {
            int tableNumber = i;
            String qrCode = String.format("QS-TABLE-%03d", i);

            if (tableRepository.existsByTableNumber(tableNumber)) {
                log.info("[Seed] Table {} already exists — skipping.", tableNumber);
                continue;
            }
            if (tableRepository.existsByQrCode(qrCode)) {
                log.info("[Seed] QR code {} already exists — skipping.", qrCode);
                continue;
            }

            RestaurantTable table = RestaurantTable.builder()
                    .tableNumber(tableNumber)
                    .capacity(4)
                    .qrCode(qrCode)
                    .status(TableStatus.AVAILABLE)
                    .active(true)
                    .build();
            tableRepository.save(table);
            log.info("[Seed] Table created → #{} ({})", tableNumber, qrCode);
        }
    }

    // ── Menu Items ────────────────────────────────────────────────────────────

    private void seedMenuItems() {
        // Map: item name → { categoryName, price, description }
        List<MenuItemSeed> items = List.of(
                new MenuItemSeed("Coffee",          "Beverages",   new BigDecimal("60.00"),  "Hot freshly brewed coffee",               5),
                new MenuItemSeed("Tea",             "Beverages",   new BigDecimal("40.00"),  "Masala chai tea",                         3),
                new MenuItemSeed("Lemon Juice",     "Beverages",   new BigDecimal("50.00"),  "Fresh-squeezed lemon juice",              5),
                new MenuItemSeed("Veg Fried Rice",  "Main Course", new BigDecimal("150.00"), "Stir-fried rice with vegetables",         20),
                new MenuItemSeed("Chicken Biryani", "Main Course", new BigDecimal("220.00"), "Fragrant basmati rice with spiced chicken", 30),
                new MenuItemSeed("Spring Rolls",    "Starters",    new BigDecimal("90.00"),  "Crispy vegetable spring rolls",           12),
                new MenuItemSeed("Paneer Tikka",    "Starters",    new BigDecimal("130.00"), "Grilled cottage cheese with spices",      15),
                new MenuItemSeed("Ice Cream",       "Desserts",    new BigDecimal("80.00"),  "Vanilla / Chocolate scoops",              5)
        );

        for (MenuItemSeed seed : items) {
            if (menuItemRepository.existsByNameIgnoreCase(seed.name())) {
                log.info("[Seed] Menu item '{}' already exists — skipping.", seed.name());
                continue;
            }
            Category category = categoryRepository.findByNameIgnoreCase(seed.categoryName())
                    .orElse(null);
            if (category == null) {
                log.warn("[Seed] Category '{}' not found — skipping item '{}'.", seed.categoryName(), seed.name());
                continue;
            }
            MenuItem item = MenuItem.builder()
                    .name(seed.name())
                    .description(seed.description())
                    .price(seed.price())
                    .preparationTime(seed.preparationTime())
                    .category(category)
                    .available(true)
                    .build();
            menuItemRepository.save(item);
            log.info("[Seed] Menu item created → {} (₹{}, ~{}min)", seed.name(), seed.price(), seed.preparationTime());
        }
    }

    // ── Inner record ─────────────────────────────────────────────────────────

    private record MenuItemSeed(String name, String categoryName, BigDecimal price, String description, Integer preparationTime) {}
}
