# URL Shortener Application

A modern React-based URL shortener with comprehensive analytics, real-time click tracking, and integrated logging middleware.

## Features

- 🔗 **URL Shortening**: Create short URLs with custom expiry times (1 minute to 1 week)
- 🎯 **Custom Short Codes**: Optional personalized short codes (3-10 alphanumeric characters)
- 📊 **Real-time Analytics**: Comprehensive statistics and click tracking
- 🌍 **Geolocation Tracking**: Track click locations with IP geolocation
- 📱 **Responsive Design**: Mobile-first design with Material-UI
- 🔧 **Comprehensive Logging**: Integrated logging middleware with Afformed test server
- 💾 **Client-side Persistence**: Data stored locally with automatic cleanup
- ⚡ **Performance Optimized**: Fast loading and responsive interactions

## Architecture

This application demonstrates modern React development practices with:
- **Layered Architecture**: Clear separation between presentation, business logic, and data layers
- **TypeScript**: Full type safety throughout the application
- **Service-Oriented Design**: Business logic abstracted into reusable services
- **Comprehensive Logging**: Every major operation logged for monitoring and debugging
- **Material-UI**: Consistent, accessible design system

## Tech Stack

- **React 19.1.0** - Modern component-based UI library
- **TypeScript 4.9.5** - Type safety and better developer experience
- **Material-UI 7.1.2** - Comprehensive React component library
- **React Router 7.6.2** - Client-side routing for single-page application
- **Custom Logging Middleware** - Integrated logging solution

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
