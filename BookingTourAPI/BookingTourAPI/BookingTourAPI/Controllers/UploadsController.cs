using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("api/upload")]
    public class UploadsController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;

        public UploadsController(IConfiguration config)
        {
            var cloudinarySettings = config.GetSection("CloudinarySettings");
            var account = new Account(
                cloudinarySettings["CloudName"],
                cloudinarySettings["ApiKey"],
                cloudinarySettings["ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
        }

        [HttpPost("cloudinary/test")]
        public async Task<IActionResult> UploadSingleTest(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "Không có file được upload" });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { success = false, message = "Chỉ cho phép upload file ảnh!" });

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "uploads"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                return StatusCode(500, new { success = false, message = uploadResult.Error.Message });

            return Ok(new
            {
                success = true,
                url = uploadResult.SecureUrl.ToString(),
                public_id = uploadResult.PublicId,
                width = uploadResult.Width,
                height = uploadResult.Height,
                format = uploadResult.Format,
                bytes = uploadResult.Bytes
            });
        }

        [HttpPost("cloudinary")]
        // [Authorize] Bật khi deploy auth
        public async Task<IActionResult> UploadSingle(IFormFile file)
        {
            return await UploadSingleTest(file);
        }

        [HttpPost("cloudinary/multiple")]
        // [Authorize] Bật khi deploy auth
        public async Task<IActionResult> UploadMultiple(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest(new { success = false, message = "Không có file được upload" });

            var results = new List<object>();

            foreach (var file in files)
            {
                if (!file.ContentType.StartsWith("image/")) continue;

                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "uploads"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error == null)
                {
                    results.Add(new
                    {
                        url = uploadResult.SecureUrl.ToString(),
                        public_id = uploadResult.PublicId,
                        width = uploadResult.Width,
                        height = uploadResult.Height,
                        format = uploadResult.Format,
                        bytes = uploadResult.Bytes
                    });
                }
            }

            return Ok(new
            {
                success = true,
                files = results,
                count = results.Count
            });
        }

        [HttpDelete("cloudinary/{*publicId}")]
        // [Authorize] Bật khi deploy auth
        public async Task<IActionResult> DeleteImage(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return BadRequest(new { success = false, message = "Public ID không hợp lệ" });

            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Result == "ok")
            {
                return Ok(new { success = true, result });
            }

            return StatusCode(500, new { success = false, message = "Lỗi xóa ảnh", error = result.Error?.Message });
        }
    }
}
