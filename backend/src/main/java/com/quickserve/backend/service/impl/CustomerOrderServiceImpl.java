package com.quickserve.backend.service.impl;

import com.quickserve.backend.dto.OrderItemRequest;
import com.quickserve.backend.dto.OrderItemResponse;
import com.quickserve.backend.dto.OrderRequest;
import com.quickserve.backend.dto.OrderResponse;
import com.quickserve.backend.entity.CustomerOrder;
import com.quickserve.backend.entity.MenuItem;
import com.quickserve.backend.entity.OrderItem;
import com.quickserve.backend.entity.OrderStatus;
import com.quickserve.backend.exception.ResourceNotFoundException;
import com.quickserve.backend.repository.CustomerOrderRepository;
import com.quickserve.backend.repository.MenuItemRepository;
import com.quickserve.backend.service.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerOrderServiceImpl implements CustomerOrderService {

    private final CustomerOrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public OrderResponse placeOrder(OrderRequest request) {
        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(generateOrderNumber())
                .tableNumber(request.getTableNumber().trim())
                .specialInstructions(request.getSpecialInstructions() != null ? request.getSpecialInstructions().trim() : null)
                .status(OrderStatus.PENDING)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem", itemReq.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException("Menu item '" + menuItem.getName() + "' is currently unavailable");
            }

            BigDecimal unitPrice = menuItem.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .menuItem(menuItem)
                    .build();

            order.addOrderItem(orderItem);
        }

        order.setTotalAmount(totalAmount);

        CustomerOrder savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        CustomerOrder order = findOrThrow(id);
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    @Override
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("CustomerOrder", id);
        }
        orderRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private CustomerOrder findOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomerOrder", id));
    }

    private String generateOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "ORD-" + dateStr + "-" + randomSuffix;
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableNumber(order.getTableNumber())
                .status(order.getStatus())
                .specialInstructions(order.getSpecialInstructions())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
