package com.quickserve.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when attempting to create/update a resource that would violate
 * a uniqueness constraint (e.g. duplicate category name).
 * The GlobalExceptionHandler maps this to HTTP 409 Conflict.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(resourceName + " with " + fieldName + " '" + fieldValue + "' already exists");
    }
}
