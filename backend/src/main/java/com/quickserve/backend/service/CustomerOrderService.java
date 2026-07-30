package com.quickserve.backend.service;

import com.quickserve.backend.dto.OrderRequest;
import com.quickserve.backend.dto.OrderResponse;
import com.quickserve.backend.entity.OrderStatus;

import java.util.List;

public interface CustomerOrderService {

    /**
     * Places a new order.
     * Generates a unique order number, calculates subtotals and total,
     * and saves the order and its items.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if any menu item doesn't exist
     * @throws IllegalArgumentException if any requested menu item is unavailable
     */
    OrderResponse placeOrder(OrderRequest request);

    /**
     * Returns an order by ID.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    OrderResponse getOrderById(Long id);

    /**
     * Returns all orders, newest first.
     */
    List<OrderResponse> getAllOrders();

    /**
     * Returns all orders matching the given status, newest first.
     */
    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    /**
     * Updates the status of an existing order.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    OrderResponse updateOrderStatus(Long id, OrderStatus newStatus);

    /**
     * Deletes an order permanently.
     *
     * @throws com.quickserve.backend.exception.ResourceNotFoundException if not found
     */
    void deleteOrder(Long id);
}
