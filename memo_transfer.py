#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
华为备忘录 → Vivo 转移工具
功能：读取华为备忘录文件，转换为vivo兼容格式
"""

import os
import json
import csv
from datetime import datetime
from typing import List, Dict
import argparse


class MemoItem:
    def __init__(self, title: str = "", content: str = "", date: str = None):
        self.title = title or "无标题"
        self.content = content or ""
        self.date = date or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def to_dict(self) -> Dict:
        return {
            "title": self.title,
            "content": self.content,
            "date": self.date
        }


class HuaweiMemoParser:
    @staticmethod
    def parse_txt_file(file_path: str) -> List[MemoItem]:
        """解析华为备忘录TXT文件"""
        memos = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            filename = os.path.basename(file_path).replace('.txt', '')
            lines = content.split('\n')
            
            memo = MemoItem(title=filename)
            content_started = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # 识别日期行
                if not content_started and (
                    '年' in line and '月' in line or
                    '/' in line or '-' in line
                ) and len(line) < 50:
                    memo.date = line
                else:
                    if not content_started and not memo.content:
                        memo.title = line
                    else:
                        memo.content += line + '\n'
                    content_started = True
            
            if memo.content or memo.title != filename:
                memos.append(memo)
                
        except Exception as e:
            print(f"解析文件 {file_path} 出错: {e}")
        
        return memos
    
    @staticmethod
    def parse_csv_file(file_path: str) -> List[MemoItem]:
        """解析CSV文件"""
        memos = []
        try:
            # 尝试多种编码
            encodings = ['utf-8-sig', 'utf-8', 'gbk', 'gb18030']
            file_obj = None
            
            for encoding in encodings:
                try:
                    file_obj = open(file_path, 'r', encoding=encoding, newline='')
                    break
                except UnicodeDecodeError:
                    continue
            
            if file_obj is None:
                print(f"无法解码文件 {file_path}")
                return memos
            
            with file_obj:
                reader = csv.DictReader(file_obj)
                for row in reader:
                    memo = MemoItem()
                    for key, value in row.items():
                        key_lower = key.lower()
                        if '标题' in key_lower or 'title' in key_lower or 'name' in key_lower:
                            memo.title = value
                        elif '内容' in key_lower or 'content' in key_lower or 'body' in key_lower:
                            memo.content = value
                        elif '时间' in key_lower or '日期' in key_lower or 'date' in key_lower:
                            memo.date = value
                    if memo.title or memo.content:
                        memos.append(memo)
                        
        except Exception as e:
            print(f"解析CSV文件 {file_path} 出错: {e}")
        return memos
    
    @staticmethod
    def parse_json_file(file_path: str) -> List[MemoItem]:
        """解析JSON文件"""
        memos = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        memo = MemoItem(
                            title=item.get('title') or item.get('name', ''),
                            content=item.get('content') or item.get('body') or item.get('text', ''),
                            date=item.get('date') or item.get('time') or item.get('createdAt')
                        )
                        memos.append(memo)
        except Exception as e:
            print(f"解析JSON文件 {file_path} 出错: {e}")
        return memos


class VivoMemoExporter:
    @staticmethod
    def export_txt(memos: List[MemoItem], output_path: str):
        """导出为TXT格式（vivo兼容）"""
        content = ""
        for i, memo in enumerate(memos, 1):
            content += f"{'='*50}\n"
            content += f"【{memo.title}】\n"
            content += f"时间: {memo.date}\n"
            content += f"{'-'*50}\n"
            content += f"{memo.content}\n\n"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"已导出TXT格式到: {output_path}")
    
    @staticmethod
    def export_csv(memos: List[MemoItem], output_path: str):
        """导出为CSV格式（vivo兼容）"""
        with open(output_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['标题', '内容', '时间'])
            for memo in memos:
                writer.writerow([memo.title, memo.content, memo.date])
        print(f"已导出CSV格式到: {output_path}")
    
    @staticmethod
    def export_json(memos: List[MemoItem], output_path: str):
        """导出为JSON格式"""
        data = [memo.to_dict() for memo in memos]
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"已导出JSON格式到: {output_path}")


def process_files(input_paths: List[str], output_dir: str = "./output"):
    """处理文件"""
    os.makedirs(output_dir, exist_ok=True)
    
    all_memos = []
    parser = HuaweiMemoParser()
    
    # 解析所有输入文件
    for path in input_paths:
        if os.path.isfile(path):
            ext = os.path.splitext(path)[1].lower()
            if ext == '.txt':
                print(f"正在解析: {path}")
                all_memos.extend(parser.parse_txt_file(path))
            elif ext == '.csv':
                print(f"正在解析CSV: {path}")
                all_memos.extend(parser.parse_csv_file(path))
            elif ext == '.json':
                print(f"正在解析JSON: {path}")
                all_memos.extend(parser.parse_json_file(path))
        elif os.path.isdir(path):
            # 处理文件夹 - 递归处理所有txt文件
            print(f"\n处理文件夹: {path}")
            for root, dirs, files in os.walk(path):
                for filename in sorted(files):
                    file_path = os.path.join(root, filename)
                    ext = os.path.splitext(filename)[1].lower()
                    if ext == '.txt':
                        print(f"  解析中: {filename}")
                        all_memos.extend(parser.parse_txt_file(file_path))
                    elif ext == '.csv':
                        print(f"  解析CSV: {filename}")
                        all_memos.extend(parser.parse_csv_file(file_path))
    
    if not all_memos:
        print("未找到任何备忘录数据！")
        return
    
    print(f"\n✅ 共解析到 {len(all_memos)} 条备忘录")
    print(f"   - 总标题数: {sum(1 for m in all_memos if m.title and m.title != '无标题')}")
    print(f"   - 总字符数: {sum(len(m.content or '') for m in all_memos)}")
    print()
    
    # 导出
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    exporter = VivoMemoExporter()
    
    exporter.export_txt(all_memos, os.path.join(output_dir, f"vivo_memos_{timestamp}.txt"))
    exporter.export_csv(all_memos, os.path.join(output_dir, f"vivo_memos_{timestamp}.csv"))
    exporter.export_json(all_memos, os.path.join(output_dir, f"vivo_memos_{timestamp}.json"))
    
    print(f"📦 已生成3种格式的文件到 output/ 文件夹")
    print(f"\n✅ 转换完成！请将文件传输到vivo手机")


def main():
    parser = argparse.ArgumentParser(description='华为备忘录 → Vivo 转移工具')
    parser.add_argument('inputs', nargs='+', help='输入文件或文件夹路径')
    parser.add_argument('-o', '--output', default='./output', help='输出文件夹 (默认: ./output)')
    
    args = parser.parse_args()
    
    print("="*60)
    print("华为备忘录 → Vivo 转移工具")
    print("="*60)
    print()
    
    process_files(args.inputs, args.output)
    
    print("\n使用说明:")
    print("1. 将 output 文件夹中的文件传输到vivo手机")
    print("2. 打开vivo原子笔记/备忘录")
    print("3. 进入设置 → 导入数据")
    print("4. 选择TXT或CSV文件进行导入")


if __name__ == "__main__":
    main()
