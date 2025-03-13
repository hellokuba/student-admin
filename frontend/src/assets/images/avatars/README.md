# 默认头像

本目录包含学生管理系统中使用的默认头像SVG文件。这些头像根据用户角色自动分配，为用户提供视觉上的角色识别。

## 头像文件

- `admin-avatar.svg` - 管理员默认头像（红色背景，带皇冠图标）
- `teacher-avatar.svg` - 教师默认头像（蓝色背景，带书本图标）
- `student-avatar.svg` - 学生默认头像（绿色背景，带毕业帽图标）
- `default-avatar.svg` - 通用默认头像（灰色背景，简单面部）

## 使用方法

系统通过 `avatarService` 服务自动处理头像的分配。当用户没有设置自定义头像时，系统会根据用户角色分配相应的默认头像。

### 在组件中使用

```javascript
import { avatarService } from '@/services/avatarService'

// 在 setup 中
const userAvatar = computed(() => avatarService.getUserAvatar(user))
```

### 直接获取特定角色的头像

```javascript
import { avatarService } from '@/services/avatarService'

// 获取管理员头像
const adminAvatar = avatarService.getDefaultAvatarByRole('admin')
```

## 自定义

如需修改默认头像，可以直接编辑对应的 SVG 文件。SVG 文件使用标准的 SVG 格式，可以使用任何 SVG 编辑器进行修改。 