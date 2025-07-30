#!/usr/bin/env node

/**
 * 性能优化脚本
 * 用于检查和优化项目性能
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 性能指标配置
const performanceMetrics = {
  maxBundleSize: 500 * 1024, // 500KB
  maxChunkSize: 200 * 1024,  // 200KB
  maxImageSize: 100 * 1024,  // 100KB
  maxCssSize: 50 * 1024,     // 50KB
}

// 检查文件大小
function checkFileSize(filePath, maxSize) {
  try {
    const stats = fs.statSync(filePath)
    const sizeInKB = stats.size / 1024
    const sizeInMB = sizeInKB / 1024
    
    if (stats.size > maxSize) {
      console.warn(`⚠️  文件过大: ${filePath}`)
      console.warn(`   大小: ${sizeInKB.toFixed(2)}KB (${sizeInMB.toFixed(2)}MB)`)
      console.warn(`   限制: ${maxSize / 1024}KB`)
      return false
    }
    return true
  } catch (err) {
    console.error(`❌ 无法检查文件: ${filePath}`, err.message)
    return false
  }
}

// 检查构建产物
function checkBuildOutput() {
  console.log('🔍 检查构建产物...')
  
  const buildDir = path.join(__dirname, '..', '.next')
  if (!fs.existsSync(buildDir)) {
    console.log('📁 构建目录不存在，跳过检查')
    return
  }

  let hasIssues = false

  // 检查静态文件
  const staticDir = path.join(buildDir, 'static')
  if (fs.existsSync(staticDir)) {
    const checkStaticFiles = (dir) => {
      const files = fs.readdirSync(dir)
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
          checkStaticFiles(filePath)
        } else {
          const ext = path.extname(file).toLowerCase()
          let maxSize = performanceMetrics.maxBundleSize
          
          if (ext === '.css') {
            maxSize = performanceMetrics.maxCssSize
          } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
            maxSize = performanceMetrics.maxImageSize
          }
          
          if (!checkFileSize(filePath, maxSize)) {
            hasIssues = true
          }
        }
      })
    }
    
    checkStaticFiles(staticDir)
  }

  if (!hasIssues) {
    console.log('✅ 构建产物检查通过')
  }
}

// 检查依赖包大小
function checkDependencies() {
  console.log('📦 检查依赖包...')
  
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    }
    
    console.log(`📊 总依赖数量: ${Object.keys(dependencies).length}`)
    
    // 检查大型依赖
    const largeDependencies = [
      'react', 'react-dom', 'next', '@types/react', '@types/react-dom'
    ]
    
    largeDependencies.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`📦 ${dep}: ${dependencies[dep]}`)
      }
    })
    
  } catch (err) {
    console.error('❌ 检查依赖失败:', err.message)
  }
}

// 清理缓存
function cleanCache() {
  console.log('🧹 清理缓存...')
  
  const cacheDirs = [
    '.next',
    'node_modules/.cache',
    '.eslintcache'
  ]
  
  cacheDirs.forEach(dir => {
    const cachePath = path.join(__dirname, '..', dir)
    if (fs.existsSync(cachePath)) {
      try {
        fs.rmSync(cachePath, { recursive: true, force: true })
        console.log(`✅ 已清理: ${dir}`)
      } catch (err) {
        console.error(`❌ 清理失败: ${dir}`, err.message)
      }
    }
  })
}

// 优化构建
function optimizeBuild() {
  console.log('⚡ 优化构建...')
  
  try {
    // 设置环境变量
    process.env.NODE_ENV = 'production'
    process.env.NEXT_TELEMETRY_DISABLED = '1'
    
    // 运行构建 - 使用安全的命令执行方式
    const buildCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const buildArgs = ['run', 'build']
    
    execSync(buildCommand, { 
      args: buildArgs,
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    
    console.log('✅ 构建优化完成')
    
  } catch (err) {
    console.error('❌ 构建优化失败:', err.message)
  }
}

// 生成性能报告
function generateReport() {
  console.log('📊 生成性能报告...')
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      buildOutput: false,
      dependencies: false,
      cacheCleaned: false,
      buildOptimized: false
    },
    recommendations: []
  }
  
  // 执行检查
  try {
    checkBuildOutput()
    report.checks.buildOutput = true
  } catch {
    report.recommendations.push('检查构建产物失败')
  }
  
  try {
    checkDependencies()
    report.checks.dependencies = true
  } catch {
    report.recommendations.push('检查依赖失败')
  }
  
  try {
    cleanCache()
    report.checks.cacheCleaned = true
  } catch {
    report.recommendations.push('清理缓存失败')
  }
  
  try {
    optimizeBuild()
    report.checks.buildOptimized = true
  } catch {
    report.recommendations.push('优化构建失败')
  }
  
  // 保存报告
  const reportPath = path.join(__dirname, '..', 'performance-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log('📄 性能报告已保存到: performance-report.json')
  
  return report
}

// 主函数
function main() {
  console.log('🚀 开始性能优化检查...\n')
  
  const report = generateReport()
  
  console.log('\n📋 检查结果:')
  Object.entries(report.checks).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${check}`)
  })
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 建议:')
    report.recommendations.forEach(rec => {
      console.log(`   • ${rec}`)
    })
  }
  
  console.log('\n✨ 性能优化检查完成!')
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  checkFileSize,
  checkBuildOutput,
  checkDependencies,
  cleanCache,
  optimizeBuild,
  generateReport
} 