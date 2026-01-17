# Layout Components - Clean Architecture

This directory contains layout-related components following clean architecture principles for maintainability and scalability.

## Architecture Principles

### 1. **Separation of Concerns**
- Each component has a single, well-defined responsibility
- Business logic is separated from presentation
- Type definitions are externalized for reusability

### 2. **Component Structure**
```
components/
├── layout/              # Layout-specific components
│   ├── Breadcrumbs.tsx # Breadcrumb navigation
│   ├── index.ts        # Barrel exports
│   └── README.md       # Documentation
├── page-header.tsx     # Main page header component
types/
└── components/
    └── page-header.types.ts  # Shared type definitions
```

### 3. **Design Patterns Used**

#### Composition Pattern
Components are composed of smaller, reusable parts:
- `PageHeader` uses `Breadcrumbs` component
- Each component can be used independently

#### Props Pattern
Clear, typed interfaces for all components:
```typescript
interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    children?: React.ReactNode;
}
```

## Components

### PageHeader

Main page header with SVG pattern background.

**Features:**
- Responsive design (mobile-first)
- SVG pattern background
- Optional breadcrumb navigation
- Optional description
- Extensible with children slot
- Customizable styling via className

**Usage:**
```tsx
import PageHeader from '@/components/page-header';

<PageHeader
    title="Dashboard"
    description="Manage your application settings and data"
    breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Dashboard' }
    ]}
/>
```

**With custom content:**
```tsx
<PageHeader title="Products">
    <div className="flex gap-4 mt-4">
        <Button>Add Product</Button>
        <Button variant="outline">Export</Button>
    </div>
</PageHeader>
```

### Breadcrumbs

Hierarchical navigation component.

**Features:**
- Automatic separator rendering
- Active/inactive state styling
- Inertia.js Link integration
- Accessible ARIA labels

**Usage:**
```tsx
import { Breadcrumbs } from '@/components/layout';

<Breadcrumbs
    items={[
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'Edit Product' }
    ]}
/>
```

## Color System

The components use the custom color scheme defined in `app.css`:

- **Primary Color:** `#2547F9` (Brand blue)
- **Background Color:** `#F7F8FD` (Light blue-gray)

Colors are referenced via Tailwind CSS custom properties:
```css
--color-primary: #2547F9
--color-background: #F7F8FD
```

## Styling Guidelines

### 1. **Use Semantic Color Tokens**
```tsx
// ✅ Good - Uses semantic tokens
className="text-foreground bg-background"

// ❌ Bad - Hardcoded colors
className="text-slate-800 bg-white"
```

### 2. **Responsive Design**
```tsx
// Mobile-first approach
className="text-3xl sm:text-4xl lg:text-5xl"
```

### 3. **Composition with cn() Utility**
```tsx
className={cn(
    'base-styles',
    'responsive-styles sm:larger-styles',
    customClassName
)}
```

## Type Safety

All components are fully typed with TypeScript:

```typescript
// Shared types in types/components/
export interface BreadcrumbItem {
    name: string;
    href?: string;
}

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    children?: React.ReactNode;
}
```

## Maintenance Guidelines

### Adding New Layout Components

1. Create component in `components/layout/`
2. Define types in `types/components/`
3. Export from `components/layout/index.ts`
4. Document usage in this README

### Modifying Existing Components

1. Check type definitions first
2. Update component implementation
3. Update types if needed
4. Test with existing usage
5. Update documentation

## Best Practices

1. **Keep components small and focused**
   - Each component should do one thing well
   - Extract reusable logic into separate functions

2. **Use proper TypeScript types**
   - Avoid `any` types
   - Use interfaces for component props
   - Export types for reusability

3. **Follow Tailwind CSS conventions**
   - Use utility classes
   - Leverage design tokens
   - Maintain consistent spacing

4. **Document complex logic**
   - Add JSDoc comments for public APIs
   - Explain non-obvious implementations
   - Provide usage examples

5. **Test thoroughly**
   - Test with different prop combinations
   - Verify responsive behavior
   - Check accessibility

## Related Files

- `resources/css/app.css` - Global styles and theme configuration
- `resources/js/lib/utils.ts` - Utility functions (cn, etc.)
- `tailwind.config.*` - Tailwind CSS configuration
