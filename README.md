# 色彩空间转换程序

一个基于 Next.js 开发的色彩空间转换工具，用于实现设备相关的 RGB 码值与设备无关的 CIE 1931 XYZ 三刺激值之间的双向转换。

项目实现了完整的颜色转换链路，包括非线性传递函数解码与编码、3x3 矩阵运算、逆矩阵求解、白点适配，以及 CIE 1931 色度图可视化与交互。

## 项目简介

本项目提供以下能力：

- 正向转换：`RGB -> XYZ`
- 逆向转换：`XYZ -> RGB`
- 多种 RGB 色彩空间与白点选择
- 色域对比可视化
- CIE 1931 马蹄图绘制与交互
- 实时数值输出与颜色预览

## 功能特性

- 支持多种 RGB 色彩空间：
  `sRGB / Rec.709`、`Adobe RGB (1998)`、`Apple RGB`、`ProPhoto RGB`、`Display P3`、`Rec. 2020`、`Wide Gamut RGB`、`ColorMatch RGB`、`NTSC RGB`、`PAL/SECAM RGB`、`CIE RGB`
- 支持多种参考白点：
  `A`、`C`、`D50`、`D55`、`D65`、`D75`、`E`、`F2`、`F7`、`F11`
- 支持不同传递函数，包括：
  `sRGB`、`Rec.2020`、`ProPhoto` 以及多种 gamma 曲线
- 根据原色坐标与参考白点计算 RGB 到 XYZ 的标准 3x3 矩阵
- 使用逆矩阵完成 XYZ 到 RGB 的反向映射
- 在白点不一致时应用 Bradford 色适应变换
- 输出以下结果：
  `XYZ`、`xyY`、`CIELAB`、目标色彩空间 RGB、0-255 码值、颜色预览
- 提供交互式 CIE 1931 色度图，包含：
  光谱轨迹、普朗克轨迹、白点标记、当前颜色点和色域三角形叠加

## 转换流程

### 正向转换：RGB -> XYZ

1. 接收选定色彩空间下的 RGB 输入
2. 通过传递函数执行非线性解码，恢复线性光能量
3. 使用 RGB 到 XYZ 的 3x3 矩阵执行线性代数乘法
4. 如有需要，进行白点适配
5. 输出 CIE 1931 XYZ 三刺激值

### 逆向转换：XYZ -> RGB

1. 读取当前颜色对应的 XYZ 值
2. 如有需要，执行白点适配
3. 使用 XYZ 到 RGB 的逆矩阵完成反向映射
4. 对超出色域的值进行裁剪
5. 应用目标色彩空间的非线性编码
6. 输出目标色彩空间的 RGB 码值

## 界面说明

页面主要由三部分组成：

- 输入区域：
  选择源色彩空间、参考白点、RGB 输入模式，并输入 RGB 或 Hex 值
- 可视化区域：
  显示 CIE 1931 色度图，并支持色域对比和图中交互
- 输出区域：
  显示 XYZ、xyY、CIELAB、逆向 RGB 结果、是否超色域提示以及转换矩阵

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## 运行环境

- Node.js `20.9+`
- npm

支持平台：

- Windows
- Linux
- macOS

## 快速开始

```bash
git clone https://github.com/JHBOY-ha/color-space-transform.git
cd color-space-transform
npm install
npm run dev
```

启动后访问：

- `http://localhost:3000`
- 或 `http://127.0.0.1:3000`

> [!NOTE]
> Next.js 16 在开发模式下会限制部分 dev 资源的访问来源。本项目已经配置了 `allowedDevOrigins`，重启开发服务器后，可正常通过 `localhost`、`127.0.0.1` 以及当前机器的局域网 IPv4 地址访问。

## 从零部署

### 1. 安装 Node.js

请先安装 Node.js `20.9+`：

- https://nodejs.org/en/download

### 2. 克隆项目

```bash
git clone https://github.com/JHBOY-ha/color-space-transform.git
cd color-space-transform
```

### 3. 安装依赖

```bash
npm install
```

### 4. 构建生产版本

```bash
npm run build
```

### 5. 启动生产服务

```bash
npm start
```

默认端口为 `3000`。

## Linux 部署方式

### 基础部署

```bash
git clone https://github.com/JHBOY-ha/color-space-transform.git
cd color-space-transform
npm install
npm run build
PORT=3000 npm start
```

建议生产环境配合：

- `Nginx` 或 `Caddy` 反向代理
- `systemd`、`pm2` 或 Docker 保持进程常驻

## Windows 部署方式

### PowerShell 示例

```powershell
git clone https://github.com/JHBOY-ha/color-space-transform.git
cd color-space-transform
npm install
npm run build
$env:PORT=3000
npm start
```

## 常用命令

- `npm run dev`
  启动开发服务器
- `npm run build`
  构建生产版本
- `npm start`
  启动生产服务
- `npm run lint`
  执行 ESLint 检查

## 项目结构

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    InputPanel.tsx
    OutputPanel.tsx
    CIEDiagram.tsx
    GamutComparison.tsx
    MatrixDisplay.tsx
    ColorSwatch.tsx
  lib/
    colorConvert.ts
    colorData.ts
    matrix.ts
    transferFunctions.ts
```

## 参考资料

- Bruce Lindbloom Color Calculator
  http://www.brucelindbloom.com/
- Useful Color Equations
  http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html

## 当前实现情况

当前版本已经覆盖项目核心要求：

- RGB 到 XYZ 转换
- XYZ 到 RGB 转换
- 矩阵计算与逆矩阵求解
- 电光转换函数处理
- 多种 RGB 标准与白点选择
- CIE 1931 马蹄图与色域可视化
