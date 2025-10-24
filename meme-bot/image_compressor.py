"""
Image Compression and Optimization Module
Handles various image compression formats and quality levels for meme optimization.
"""

import os
from PIL import Image
from io import BytesIO
from typing import Dict, Tuple, Optional


class ImageCompressor:
    """
    A utility class for compressing and optimizing images with multiple format support.
    Supports JPEG, WebP, and PNG formats with configurable quality levels.
    """

    # Quality presets for different compression levels
    QUALITY_PRESETS = {
        'high': {'jpeg': 85, 'webp': 85, 'png': None},
        'medium': {'jpeg': 75, 'webp': 75, 'png': None},
        'low': {'jpeg': 60, 'webp': 60, 'png': 6}
    }

    # Format to file extension mapping
    FORMAT_EXTENSIONS = {
        'jpeg': '.jpg',
        'webp': '.webp',
        'png': '.png'
    }

    @staticmethod
    def get_file_size(file_path: str) -> float:
        """
        Get the size of a file in kilobytes.
        
        Args:
            file_path (str): Path to the file
            
        Returns:
            float: File size in KB
        """
        if os.path.exists(file_path):
            return os.path.getsize(file_path) / 1024
        return 0

    @staticmethod
    def format_file_size(size_kb: float) -> str:
        """
        Format file size in human-readable format.
        
        Args:
            size_kb (float): Size in kilobytes
            
        Returns:
            str: Formatted size string (e.g., "1.25 MB")
        """
        if size_kb < 1:
            return f"{size_kb * 1024:.0f} B"
        elif size_kb < 1024:
            return f"{size_kb:.2f} KB"
        else:
            return f"{size_kb / 1024:.2f} MB"

    @classmethod
    def compress_image(
        cls,
        input_path: str,
        output_path: str,
        format: str = 'jpeg',
        quality_level: str = 'medium',
        resize_ratio: float = 1.0
    ) -> Dict[str, any]:
        """
        Compress an image with specified format and quality level.
        
        Args:
            input_path (str): Path to the input image
            output_path (str): Path for the compressed output
            format (str): Output format ('jpeg', 'webp', 'png')
            quality_level (str): Quality preset ('high', 'medium', 'low')
            resize_ratio (float): Resize multiplier (1.0 = no resize, 0.5 = 50% size)
            
        Returns:
            dict: Compression result with success status, file size info, and metadata
        """
        try:
            # Open the image
            img = Image.open(input_path)
            
            # Convert RGBA to RGB if needed for JPEG
            if format.lower() == 'jpeg' and img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Apply resizing if needed
            if resize_ratio < 1.0:
                new_size = (int(img.width * resize_ratio), int(img.height * resize_ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Get quality settings for the format
            quality = cls.QUALITY_PRESETS.get(quality_level, cls.QUALITY_PRESETS['medium'])
            
            # Save with compression
            save_kwargs = {}
            if format.lower() == 'jpeg':
                save_kwargs = {
                    'format': 'JPEG',
                    'quality': quality['jpeg'],
                    'optimize': True
                }
            elif format.lower() == 'webp':
                save_kwargs = {
                    'format': 'WebP',
                    'quality': quality['webp'],
                    'method': 6  # Slowest but best compression
                }
            elif format.lower() == 'png':
                save_kwargs = {
                    'format': 'PNG',
                    'compress_level': quality['png'] or 9,
                    'optimize': True
                }
            
            img.save(output_path, **save_kwargs)
            
            # Get file sizes
            original_size_kb = cls.get_file_size(input_path)
            compressed_size_kb = cls.get_file_size(output_path)
            
            # Calculate compression ratio
            compression_ratio = ((original_size_kb - compressed_size_kb) / original_size_kb * 100) if original_size_kb > 0 else 0
            
            return {
                'success': True,
                'output_path': output_path,
                'format': format.lower(),
                'quality_level': quality_level,
                'original_size_kb': round(original_size_kb, 2),
                'compressed_size_kb': round(compressed_size_kb, 2),
                'compression_ratio': round(compression_ratio, 2),
                'original_size_readable': cls.format_file_size(original_size_kb),
                'compressed_size_readable': cls.format_file_size(compressed_size_kb),
                'file_extension': cls.FORMAT_EXTENSIONS[format.lower()]
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'output_path': None
            }

    @classmethod
    def compress_and_save_multiple_formats(
        cls,
        input_path: str,
        output_dir: str,
        base_filename: str,
        quality_level: str = 'medium',
        formats: list = ['jpeg', 'webp']
    ) -> Dict[str, Dict]:
        """
        Compress and save an image in multiple formats.
        
        Args:
            input_path (str): Path to the input image
            output_dir (str): Directory to save compressed outputs
            base_filename (str): Base filename without extension
            quality_level (str): Quality preset ('high', 'medium', 'low')
            formats (list): List of formats to generate
            
        Returns:
            dict: Dictionary with results for each format
        """
        results = {}
        
        for fmt in formats:
            output_path = os.path.join(
                output_dir,
                f"{base_filename}_{fmt}{cls.FORMAT_EXTENSIONS[fmt.lower()]}"
            )
            
            result = cls.compress_image(
                input_path,
                output_path,
                format=fmt,
                quality_level=quality_level
            )
            results[fmt] = result
        
        return results

    @classmethod
    def get_compression_recommendations(cls, file_path: str) -> Dict[str, any]:
        """
        Analyze an image and provide compression recommendations.
        
        Args:
            file_path (str): Path to the image file
            
        Returns:
            dict: Recommendations for compression
        """
        try:
            file_size_kb = cls.get_file_size(file_path)
            img = Image.open(file_path)
            
            recommendations = {
                'current_size_kb': round(file_size_kb, 2),
                'current_size_readable': cls.format_file_size(file_size_kb),
                'dimensions': f"{img.width}x{img.height}",
                'format': img.format or 'Unknown',
                'suggested_quality': 'high' if file_size_kb < 500 else 'medium' if file_size_kb < 1500 else 'low',
                'estimated_sizes': {}
            }
            
            # Estimate sizes for different formats and qualities
            for quality in ['high', 'medium', 'low']:
                for fmt in ['jpeg', 'webp']:
                    test_output = os.path.join(os.path.dirname(file_path), f"__test_{fmt}_{quality}.tmp")
                    result = cls.compress_image(file_path, test_output, fmt, quality)
                    
                    if result['success']:
                        key = f"{fmt}_{quality}"
                        recommendations['estimated_sizes'][key] = {
                            'size_kb': result['compressed_size_kb'],
                            'compression_ratio': result['compression_ratio']
                        }
                        # Clean up test file
                        if os.path.exists(test_output):
                            os.remove(test_output)
            
            return recommendations
            
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }
