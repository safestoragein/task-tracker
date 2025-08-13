# Team Task Tracker

A powerful, feature-rich Kanban board application built for core team task management. This modern web application provides advanced project management capabilities with an intuitive drag-and-drop interface.

## ✨ Features

### 🎯 Core Functionality
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Task Management**: Create, edit, delete, and organize tasks effortlessly
- **Team Collaboration**: Assign tasks to team members with role-based organization
- **Real-time Updates**: Instant updates and state synchronization

### 🔍 Advanced Features
- **Smart Filters**: Search, filter by assignee, priority, labels, and due dates
- **Multiple Views**: Kanban, List, Calendar, and Analytics views
- **Time Tracking**: Estimated vs actual hours with accuracy metrics
- **Priority Management**: High, medium, low priority levels with visual indicators
- **Due Date Management**: Calendar integration with overdue warnings
- **Label System**: Customizable colored labels for task categorization

### 📊 Analytics & Insights
- **Team Performance**: Individual and team productivity metrics
- **Progress Tracking**: Completion rates and trend analysis
- **Workload Distribution**: Balanced task assignment visualization
- **Time Analysis**: Estimation accuracy and time management insights

### 🎨 User Experience
- **Modern Design**: Clean, professional interface with dark/light themes
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Intuitive UX**: Contextual menus, tooltips, and smart defaults

## 🚀 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Drag & Drop**: @dnd-kit for smooth interactions
- **State Management**: React Context with localStorage persistence
- **Date Handling**: date-fns for date operations
- **Icons**: Lucide React icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run type-check` - Run TypeScript checks

## 📱 Usage Guide

### Creating Tasks
1. Click the "Add Task" button in the top right
2. Fill in task details (title, description, priority, etc.)
3. Assign to team members and set due dates
4. Add labels and subtasks as needed
5. Save to add to the board

### Managing Tasks
- **Move Tasks**: Drag tasks between columns (To Do, In Progress, Review, Done)
- **Edit Tasks**: Click the three-dot menu on any task card
- **Quick Actions**: Use keyboard shortcuts for faster navigation
- **Bulk Operations**: Select multiple tasks for batch actions

### Using Filters
- **Search**: Type in the search bar to find tasks by title
- **Filter Menu**: Click the Filters button for advanced options
- **Quick Filters**: Use preset filters for common views
- **Clear Filters**: Remove all filters with one click

### Analytics Dashboard
- **Team Performance**: View individual and team metrics
- **Progress Tracking**: Monitor completion rates over time
- **Workload Balance**: Ensure fair task distribution
- **Time Management**: Track estimation accuracy

## 🎯 Team Management

### Adding Team Members
Team members are currently managed in the TaskContext. To add new members:

1. Edit `src/contexts/TaskContext.tsx`
2. Add new members to the `teamMembers` array
3. Include: id, name, role, email, and optional avatar

### Customizing Labels
Labels can be customized in the TaskContext:

1. Edit the `labels` array in TaskContext
2. Specify: id, name, and color (hex code)
3. Labels will be available in the task creation modal

## 🔧 Customization

### Theming
The application supports light/dark themes. Customize colors in:
- `src/app/globals.css` - CSS variables
- `tailwind.config.ts` - Tailwind configuration

### Board Columns
Modify Kanban columns in:
- `src/components/KanbanBoard.tsx` - Column definitions
- Add/remove columns and set WIP limits

### Task Fields
Extend task functionality by:
1. Updating the `Task` interface in `src/types/index.ts`
2. Modifying the TaskModal component
3. Updating the TaskCard display

## 🔐 Data Persistence

- **Local Storage**: Tasks are automatically saved to browser localStorage
- **Real-time Sync**: Changes are immediately persisted
- **Data Recovery**: Tasks persist between browser sessions
- **Export Options**: Future updates will include data export features

## 🎨 Design System

### Color Scheme
- **Primary**: Blue tones for actions and emphasis
- **Status Colors**: 
  - Gray: To Do
  - Blue: In Progress  
  - Yellow: Review
  - Green: Done
- **Priority Colors**:
  - Red: High priority
  - Yellow: Medium priority
  - Green: Low priority

### Typography
- **Headings**: Inter font family
- **Body**: System font stack for optimal performance
- **Monospace**: For code and data display

## 🚀 Future Enhancements

- **Calendar View**: Full calendar integration for due dates
- **List View**: Alternative task display format  
- **Data Export**: CSV/Excel export functionality
- **Real-time Collaboration**: WebSocket integration
- **File Attachments**: Task file upload support
- **Advanced Analytics**: More detailed reporting
- **Custom Fields**: User-defined task properties
- **Automation**: Rule-based task management
- **Integration APIs**: External tool connections
- **Mobile App**: Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ for efficient team collaboration**