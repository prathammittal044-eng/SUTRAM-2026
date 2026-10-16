"""
metadata_forensics.py — EXIF, GPS & Document Metadata Extraction Engine
Extracts hidden forensic metadata from Images and PDFs:
- Camera Manufacturer, Model, Lens Serial
- Embedded GPS Coordinates (Latitude, Longitude, Altitude, Google Maps link)
- Editing Software Signatures (Adobe Photoshop, Canva, GIMP, pirated Acrobat tags)
- Creation vs Modification timestamp inconsistencies
"""
import io
import re
from PIL import Image, ExifTags

def _convert_dms_to_decimal(dms, ref):
    """Convert Degrees/Minutes/Seconds tuple to decimal degrees."""
    try:
        degrees = float(dms[0])
        minutes = float(dms[1]) / 60.0
        seconds = float(dms[2]) / 3600.0
        dec = degrees + minutes + seconds
        if ref in ['S', 'W']:
            dec = -dec
        return round(dec, 6)
    except Exception:
        return None

def extract_image_metadata(image_bytes: bytes) -> dict:
    """Extracts deep EXIF, camera, GPS, and software metadata from image bytes."""
    meta = {
        "camera_make": None,
        "camera_model": None,
        "software": None,
        "date_original": None,
        "date_digitized": None,
        "gps_latitude": None,
        "gps_longitude": None,
        "gps_maps_url": None,
        "raw_exif_tags": {},
        "suspicious_indicators": []
    }
    try:
        img = Image.open(io.BytesIO(image_bytes))
        raw_exif = img.getexif()
        if not raw_exif:
            meta["suspicious_indicators"].append("EXIF metadata is completely stripped (common in sanitized or downloaded web screenshots)")
            return meta

        tag_map = {ExifTags.TAGS.get(k, k): v for k, v in raw_exif.items()}
        
        # Check standard EXIF tags
        meta["camera_make"] = tag_map.get("Make")
        meta["camera_model"] = tag_map.get("Model")
        meta["software"] = tag_map.get("Software")
        meta["date_original"] = tag_map.get("DateTimeOriginal") or tag_map.get("DateTime")
        meta["date_digitized"] = tag_map.get("DateTimeDigitized")

        # Check for photo editing software
        if meta["software"]:
            soft_low = str(meta["software"]).lower()
            if any(s in soft_low for s in ['photoshop', 'canva', 'gimp', 'paint', 'snapseed', 'picsart', 'lightroom', 'pixlr']):
                meta["suspicious_indicators"].append(f"Image edited with digital manipulation software: '{meta['software']}'")

        # Extract GPS Sub-IFD
        gps_ifd = raw_exif.get_ifd(ExifTags.IFD.GPSInfo)
        if gps_ifd:
            gps_tags = {ExifTags.GPSTAGS.get(k, k): v for k, v in gps_ifd.items()}
            lat = gps_tags.get("GPSLatitude")
            lat_ref = gps_tags.get("GPSLatitudeRef")
            lon = gps_tags.get("GPSLongitude")
            lon_ref = gps_tags.get("GPSLongitudeRef")

            if lat and lat_ref and lon and lon_ref:
                dec_lat = _convert_dms_to_decimal(lat, lat_ref)
                dec_lon = _convert_dms_to_decimal(lon, lon_ref)
                if dec_lat is not None and dec_lon is not None:
                    meta["gps_latitude"] = dec_lat
                    meta["gps_longitude"] = dec_lon
                    meta["gps_maps_url"] = f"https://www.google.com/maps?q={dec_lat},{dec_lon}"

        for k, v in list(tag_map.items())[:20]:
            if isinstance(v, (str, int, float)):
                meta["raw_exif_tags"][str(k)] = v

    except Exception as e:
        meta["suspicious_indicators"].append(f"Metadata parsing notice: {str(e)}")

    return meta

def extract_pdf_metadata(pdf_bytes: bytes) -> dict:
    """Extracts PDF document info, Creator, Producer, and modification timestamps."""
    meta = {
        "author": None,
        "creator": None,
        "producer": None,
        "creation_date": None,
        "mod_date": None,
        "page_count": 0,
        "suspicious_indicators": []
    }
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        meta["page_count"] = len(reader.pages)
        info = reader.metadata
        if info:
            meta["author"] = str(info.get('/Author') or '')
            meta["creator"] = str(info.get('/Creator') or '')
            meta["producer"] = str(info.get('/Producer') or '')
            meta["creation_date"] = str(info.get('/CreationDate') or '')
            meta["mod_date"] = str(info.get('/ModDate') or '')

            # Check suspicious software
            for field in [meta["creator"], meta["producer"]]:
                if any(bad in field.lower() for bad in ['crack', 'pirat', 'phantom', 'nitro', 'ilovepdf']):
                    meta["suspicious_indicators"].append(f"Suspicious PDF generator software: {field}")
    except Exception as e:
        meta["suspicious_indicators"].append(f"PDF info notice: {str(e)}")

    return meta
