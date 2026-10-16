"""
image_forgery.py — Error Level Analysis (ELA) & Image Tamper Detection Lab
Performs:
1. Error Level Analysis (ELA) to highlight differential JPEG compression levels (digitally spliced receipts/UPI IDs).
2. Noise standard deviation variance mapping across spatial image tiles.
3. Generates visual difference heatmaps and calculates Tamper Risk Score (0 - 100%).
"""
import io
import os
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def analyze_image_forgery(image_bytes: bytes, original_filename: str, upload_dir: str) -> dict:
    """
    Analyzes an image for digital manipulation using Error Level Analysis (ELA) and Noise Variance.
    Saves the ELA differential heatmap into upload_dir.
    Returns structured tamper metrics and explanation.
    """
    try:
        orig = Image.open(io.BytesIO(image_bytes))
        if orig.mode != 'RGB':
            orig = orig.convert('RGB')
        
        w, h = orig.size
        # 1. Error Level Analysis (ELA)
        # Resave at fixed 92% JPEG compression
        ela_buffer = io.BytesIO()
        orig.save(ela_buffer, 'JPEG', quality=92)
        ela_buffer.seek(0)
        resaved = Image.open(ela_buffer)

        # Compute absolute difference between original and resaved
        diff = ImageChops.difference(orig, resaved)
        
        # Calculate maximum and average error scale
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema]) if extrema else 1
        scale = 255.0 / max(max_diff, 1)
        
        # Enhance difference image for visual inspection
        diff_enhanced = ImageEnhance.Brightness(diff).enhance(scale * 1.2)
        
        # Save ELA visualization
        base_name = os.path.splitext(original_filename)[0]
        ela_filename = f"ela_{base_name}.jpg"
        ela_path = os.path.join(upload_dir, ela_filename)
        diff_enhanced.save(ela_path, 'JPEG')

        # 2. Numerical Analysis & Tamper Risk Score Calculation
        diff_arr = np.array(diff).astype(float)
        mean_err = np.mean(diff_arr)
        max_err = np.max(diff_arr)
        std_err = np.std(diff_arr)

        # Tile grid noise variance check (e.g. 16x16 blocks)
        # Spliced regions (such as an edited UPI transaction ID) have starkly different compression noise
        block_size = 32
        block_variances = []
        for y in range(0, h - block_size, block_size):
            for x in range(0, w - block_size, block_size):
                block = diff_arr[y:y+block_size, x:x+block_size]
                block_variances.append(np.var(block))

        var_spread = np.std(block_variances) if block_variances else 0.0

        # Heuristic scoring:
        # Uniform images have low variance spread. Spliced/edited areas create sharp spikes.
        score = 0.0
        flags = []

        if max_err > 45:
            score += 25
            flags.append("High peak pixel differential (>45 delta in JPEG compression)")
        if std_err > 6.0:
            score += 30
            flags.append("Abnormal high-frequency error distribution across color channels")
        if var_spread > 50.0:
            score += 35
            flags.append("Significant localized block variance deviation (indicates copy-move or spliced text)")

        # Cap between 5% (baseline compression artifacts) and 98%
        tamper_score = min(max(round(score + (mean_err * 2), 1), 4.0), 98.0)
        is_tampered = tamper_score >= 45.0

        summary = (
            f"Error Level Analysis complete. Tamper Risk Score: {tamper_score}%. "
            + ("🚨 Probable image forgery or spliced elements detected." if is_tampered 
               else "✅ Compression levels appear uniform with no obvious pixel splices.")
        )

        return {
            "status": "success",
            "tamper_score": tamper_score,
            "is_tampered": is_tampered,
            "mean_error": round(float(mean_err), 2),
            "max_error": int(max_err),
            "variance_spread": round(float(var_spread), 2),
            "tamper_indicators": flags,
            "ela_image_file": ela_filename,
            "ela_image_url": f"/files/{ela_filename}",
            "summary": summary
        }

    except Exception as e:
        return {
            "status": "error",
            "tamper_score": 0.0,
            "is_tampered": False,
            "summary": f"Could not perform forgery analysis: {str(e)}",
            "tamper_indicators": [f"Error: {str(e)}"]
        }
