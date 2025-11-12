package com.transportation.product.service;

import com.transportation.product.dto.response.ProductImageResponse;
import com.transportation.product.model.ProductImage;
import com.transportation.product.repository.ProductImageRepository;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MinioService {
    private final ProductImageService service;
    private final MinioClient minioClient;
    private final ProductImageRepository productImageRepository;

    public MinioService(ProductImageService service, ProductImageRepository productImageRepository) {
        this.productImageRepository = productImageRepository;
        this.service = service;
        this.minioClient = MinioClient.builder()
                .endpoint("http://localhost:8900")
                .credentials("admin", "admin12345")
                .build();
    }

    public String generatePresignedUrl(String bucketName, String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(1, TimeUnit.HOURS) // URL có hiệu lực 1 giờ
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error generating presigned URL", e);
        }
    }

    public String getImageUrl(String productId) {
        ProductImageResponse image = service.getByProductId(productId);
        return generatePresignedUrl(image.getBucketName(), image.getObjectName());
    }
    // Upload image to Minio
    public void uploadProductImage(String productId, MultipartFile file) {
        try {
            // Kiểm tra xem product đã có ảnh chưa
            ProductImage existingImage = productImageRepository.findByProductId(productId).orElse(null);

            String bucketName = "product";
            String objectName = file.getOriginalFilename();

            // Nếu đã có ảnh cũ, xóa ảnh cũ trên MinIO
            if (existingImage != null) {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(existingImage.getBucketName())
                                .object(existingImage.getObjectName())
                                .build()
                );
            }

            // Upload ảnh mới
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // Cập nhật hoặc tạo mới ProductImage
            ProductImage productImage;
            if (existingImage != null) {
                existingImage.setBucketName(bucketName);
                existingImage.setObjectName(objectName);
                existingImage.setContentType(file.getContentType());
                existingImage.setUpdatedAt(LocalDateTime.now());
                productImage = existingImage;
            } else {
                productImage = ProductImage.builder()
                        .productId(productId)
                        .bucketName(bucketName)
                        .objectName(objectName)
                        .contentType(file.getContentType())
                        .createdAt(LocalDateTime.now())
                        .build();
            }

            productImageRepository.save(productImage);

        } catch (Exception e) {
            log.error("Error uploading image", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}

