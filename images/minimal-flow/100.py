import os
from PIL import Image


def compress_to_png(file_path, target_size_kb=500):
    """
    PNG 压缩逻辑：PNG是无损格式，无法通过降低画质来减小体积。
    策略：尝试最大化压缩保存 -> 如果依然超标，则循环缩小图片分辨率尺寸。
    """
    target_size_bytes = target_size_kb * 1024
    file_size = os.path.getsize(file_path)
    original_name = os.path.basename(file_path)
    base_name, ext = os.path.splitext(file_path)

    # 设定最终输出为png，以及临时文件路径
    final_output_path = f"{base_name}.png"
    temp_path = f"{base_name}_temp_compress.png"

    # 1. 如果原图已经是 PNG 且大小达标，直接跳过
    if file_size <= target_size_bytes and ext.lower() == '.png':
        print(f"[{original_name}] 已经是达标的 PNG，跳过处理。")
        return

    try:
        with Image.open(file_path) as img:
            # 确保图片模式支持保存为 PNG (RGBA 支持透明度，RGB 为普通彩色)
            if img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGBA') if 'transparency' in img.info else img.convert('RGB')

            # 2. 第一次尝试：直接使用 PNG 的最高压缩级别保存 (optimize=True)
            # 注意：这里的 optimize 只是优化文件结构，不会损失画质，但耗时稍长
            img.save(temp_path, format='PNG', optimize=True)

            # 3. 如果第一次保存后体积依然超标，开始缩小分辨率尺寸
            if os.path.getsize(temp_path) > target_size_bytes:
                while os.path.getsize(temp_path) > target_size_bytes:
                    width, height = img.size

                    # 防止无限缩小导致图片消失（设置一个底线，比如宽高不能小于10像素）
                    if width < 10 or height < 10:
                        print(f"[{original_name}] 警告：已达到极限尺寸，无法继续压缩。")
                        break

                    # 每次将宽高缩小为原来的 80%
                    img = img.resize((int(width * 0.8), int(height * 0.8)), Image.Resampling.LANCZOS)
                    # 再次保存检查
                    img.save(temp_path, format='PNG', optimize=True)

                print(f"[{original_name}] 成功压缩至 {os.path.getsize(temp_path) // 1024}KB (通过缩小分辨率尺寸)")
            else:
                print(f"[{original_name}] 成功转换/压缩至 {os.path.getsize(temp_path) // 1024}KB (无损结构优化)")

        # 4. 覆盖操作：安全替换原文件
        if os.path.exists(temp_path):
            # 如果原图后缀不是 .png，我们需要把原图删掉 (比如原本是 .jpg，现在生成了 .png)
            if ext.lower() != '.png':
                os.remove(file_path)

            # 将临时文件重命名为最终的 .png 文件
            os.replace(temp_path, final_output_path)

    except Exception as e:
        print(f"处理图片 {original_name} 时发生错误: {e}")
        # 发生错误时，清理可能残留的临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)


def batch_compress(target_size_kb=500):
    current_dir = os.getcwd()
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')

    # 提前获取列表
    image_files = [f for f in os.listdir(current_dir)
                   if f.lower().endswith(valid_extensions) and os.path.isfile(os.path.join(current_dir, f))]

    if not image_files:
        print("当前目录下没有找到支持的图片文件。")
        return

    print(f"⚠️ 警告：当前处于【覆盖原图】且【强制转存为PNG】模式。")
    print(f"找到了 {len(image_files)} 张图片，开始处理 (目标大小 < {target_size_kb}KB)...\n" + "-" * 40)

    for img_name in image_files:
        file_path = os.path.join(current_dir, img_name)
        compress_to_png(file_path, target_size_kb)

    print("-" * 40 + "\n批量压缩、转换 PNG 且覆盖完成！")


if __name__ == "__main__":
    # 在这里修改你期望的目标大小限制（单位：KB）
    TARGET_SIZE_IN_KB = 200
    batch_compress(target_size_kb=TARGET_SIZE_IN_KB)