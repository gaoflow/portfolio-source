---
title: '根据卫星蓝图用 Blender 重建 3D 模型'
year: 2026
date: '2026-06-15'
status: complete
categories: [design]
tags: [设计]
summary: '在我 2026 年为期 17 周的实习中，我依据 European Space Agency 公开的蓝图和资料信息重建了 Space Rider 卫星 3D 模型。'
role: '3D 建模实习生'
duration: '17 周'
featured: true
order: 8
studySequence: 16
model3d: /models/space-rider-v5.050.glb
heroImage: /images/projects/space-rider/reference/esa-earth-render.jpg
cardImageFit: cover
---

## 模型介绍

从 2026 年 4 月到 8 月，我在巴黎的 Felisiak Ingénierie & Développement 实习了 17 周。公司正在为法属圭亚那库鲁欧洲航天港建一套 3D 模型目录，让工程师能在任务审查应用里直接查看运载火箭、发射台、地面设施和作业流程等等信息。

Space Rider 是我接到的第一个完整的模型任务，也是最重要的一个。公司手里当时只有一个比例大致对、但表面和细节都不够的多边形外形（我最后没有沿用这个）。

简单来说，我的实际工作要求是只用公开的资料，用 Blender 重建 Space Rider 卫星模型。任务给的几何精度要求大约是 10 cm。

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-official-render.jpg" alt="ESA 官方 Space Rider 概念图" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA 官方 Space Rider 轨道概念渲染</figcaption>
</figure>

<video controls class="my-8 w-full rounded-xl shadow-sm" preload="metadata">
  <source src="/videos/projects/space-rider/esa-space-rider-1.mp4" type="video/mp4">
</video>

## 参考资料
ESA 的三视图蓝图是外形唯一的依据。用户指南用来确定货舱门、接近舱门和推进器的位置；通过 ESA 渲染图和硬件照片可以推测涂装和材质；前代 IXV 的照片只能用来补那些实在看不清的细节，不能决定 Space Rider 的外形。

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/official-blueprint.png" alt="ESA 三视图蓝图" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA 官方三视图蓝图</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/blueprint-calibration.png" alt="蓝图比例标定" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">蓝图 4.6 m 标定 (276.96 px/m)</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-infographic.jpg" alt="ESA Space Rider 信息图" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA 官方信息图</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/user-guide-cover.jpg" alt="Space Rider 用户指南封面" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Space Rider 用户指南封面</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/ixv.jpg" alt="前代 IXV 飞行器" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">前代 IXV 验证机参考</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-earth-render.jpg" alt="ESA Space Rider 轨道概念渲染" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA 官方轨道概念渲染</figcaption>
</figure>

<video controls class="my-8 w-full rounded-xl shadow-sm" preload="metadata">
  <source src="/videos/projects/space-rider/esa-space-rider-2.mp4" type="video/mp4">
</video>

## v1 版本

v1 版本主要是尝试绘制，不过结果几乎不可接受。第一版我只花了两天，就把整架飞行器做出来了，包含了：再入舱、服务舱、储箱、喷管、太阳翼、导航灯和贴花。

但光看渲染图，能发现非常多的问题：鼻部太尖；货舱门从曲面上凸出来；翼尖灯跑到了错误的位置；模型里还多了 Space Rider 根本不存在的垂直尾翼，以及从 IXV 那儿拿过来的隔热瓦细节。

我把尖鼻改成钝圆穹顶，清理掉脱离主体的对象，再删了尾翼、襟翼、舱门板和多余支架。

第一版我的思考是，完成度高不等于外形对。细节加得越早，后面改比例就越高。

## v2 版本

v2 里我重新做了标准外形，我把再入舱从头开始重建了一遍。早期版本只用了 31 个截面环，后来加到 91 个环、每环 32 个顶点，这才做出"后部较高、向凿形鼻部单调下降"的楔形轮廓。

这一版还修掉了三个拖了很久的问题：

- 解决了右侧贴花一直是镜像的问题。最后改成左右两个文字对象各自独立定向；
- 黑白 TPS 边界原来靠逐面材质画，改成由位置控制的解析着色器；
- 对比过后发现，机体高度高出 11%，整体压缩后重新对着蓝图核了尺寸。

v2.720 完成后，大概有了该有的形态。所以它也成了受保护的基线——后面每次回滚，都是滚回这里。

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v2-720-cinematic.jpg" alt="v2.720 受保护基线整机渲染" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v2.720 受保护基线整机形态</figcaption>
</figure>

## v3 版本

v3 开始我尝试使用 Claude Code 搭建一套自动检查循环：先选候选区域，每轮只动少量顶点，保存后再重新打开，然后检查拓扑、材质和顶点变化。

但是跑了 60 多轮之后，轮轮都通过检查，但模型几乎看不出进步。局部平滑分数一直在涨，可是没有一个固定的全局目标告诉它该往哪儿走。

这个分支最后被整个放弃，回滚到 v2。我觉得 Claude Code 这里设计的有缺陷：一个循环如果只优化局部指标、又没有蓝图这样的全局目标，它可以永远干活，却永远不靠近终点。AI Coding 给定清晰、可验收的目标非常重要。

## v4 版本

v4 里，我依旧尝试使用 Claude Code，用径向重建的办法消掉鼻尖的褶皱。褶皱确实没了，但鼻部被改短了，腹部曲线松了，黑色涂装区域也缩小了。

当我把 v4 和 v2.720 放在一起比对时，结论是新版本更差，所以整条分支又一次回滚。

这次回滚之后，我告诉 AI 一个规定：不能为了解决局部表面问题，牺牲已经验收过的比例和涂装边界。

## v5 版本

我对 v5 的宗旨改为了：先查显示问题，再动几何。v5 沿用v2.720 版本，这次首先规定把相机锁死在蓝图对比视图上。

在这个过程中，两个看起来很严重的缺陷，最后查出来根本不是几何问题。鼻尖的焊接环其实是着色接缝，开了 Weighted Normals 之后，一个顶点都不用动就消失了；鼻部那条凹陷带，则是因为 82% 的基础面绕序反了，重算一次法线就大幅好转。

从那以后，我判断几何之前先把材质切成黏土、打上掠射光。深色材质容易把平面看成洞，均匀光照又会把波纹藏住。我禁止了 Taubin 松弛，它曾经把凸形的鼻部往里拽出非常多个凹点。之后的安全工具，我只允许沿法线向外修凹陷。

但是后面又遇到了新问题，我反复挪动局部顶点，慢慢在表面堆出一条折痕带。后面换了个思路：一次性拟合整个鼻部，用 B-spline 截面加对称 Fourier 级数，具体是：共 91 个系数，拟合 rms 是 2.6 mm。

但最后发现鼻尖还是有折痕，因为控制笼的末端是个伪极点。那就说明拓扑本身就是错的，移动顶点无法根治问题。所以我干脆删掉最后所有的面，把尖端重建成一个整洁的极点扇面，至此，模型第一次达到零凹陷。所以说拓扑问题，靠继续挪顶点是解决不了的！

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.015-wide.jpg" alt="v5.015 阶段整机渲染" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.015 阶段整机</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.027-wide.jpg" alt="v5.027 阶段整机渲染" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.027 阶段整机</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.044-wide.jpg" alt="v5.044 阶段整机渲染" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.044 阶段整机</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.049-wide.jpg" alt="v5.049 阶段整机渲染" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.049 阶段整机</figcaption>
</figure>

## 蓝图才是 king

在第一次严格的蓝图对照检查中我发现：中部机体顶部高出 103 mm，鼻部低了 60–180 mm。

我按纵向站位，把机体重新映射到蓝图轮廓的 B-spline 拟合曲线上。改完之后，侧视图控制在 ±6 mm 以内，俯视图控制在 ±8.4 mm 以内。

每个横截面还被投影到拟合椭圆上检查，最差差异 2.1 mm，rms 0.5 mm。
<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/blueprint-overlay.png" alt="最终蓝图叠加结果" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">最终蓝图叠加检验（侧视 ±6 mm / 俯视 ±8.4 mm）</figcaption>
</figure>

表面平滑走的也是同一条路。最初用基于 4 cm 网格的限制器，数值检查全过，可外壳上留着 2.39 mm rms 的可见波纹。换成无网格的解析限制之后，粗糙度降到 0.09 mm rms。

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/surface-rake-before-after.png" alt="解析表面约束前后的掠射光比较" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">解析表面约束前后的掠射光波纹对比</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/animation-ready.png" alt="v5.051 动画就绪四组件版本" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.051 动画就绪四组件版本</figcaption>
</figure>

## 最终的对比

这些对比误差基本符合了最终交付要求：

| 检查内容 | 结果 |
|---|---:|
| 侧视图与蓝图 | ±6 mm 以内 |
| 俯视图与蓝图 | ±8.4 mm 以内 |
| 尾部平台平面度 | ±0.6 mm |
| 横截面椭圆拟合 | 最差 2.1 mm，rms 0.5 mm |
| 凹陷数量 | 0 |
| 表面粗糙度 | 0.09 mm rms，从 2.39 mm 降低 |
| 清理前后像素差 | 0.00000 |

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/final-vehicle.png" alt="客户验收的 v5.050 Space Rider" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">客户最终验收的 v5.050 Space Rider</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5-050-side.jpg" alt="v5.050 最终侧视形态" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">最终侧视轮廓</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5-050-persp.jpg" alt="v5.050 最终透视形态" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">最终透视形态</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-flap.jpg" alt="襟翼细节" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">襟翼细节</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-nozzle.jpg" alt="喷管细节" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">喷管细节</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-wings-full.jpg" alt="翼面细节" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">翼面细节</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-tail.jpg" alt="尾部细节" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">尾部细节</figcaption>
</figure>
