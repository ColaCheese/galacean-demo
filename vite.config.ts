import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer";
import copy from 'rollup-plugin-copy'
import vue from "@vitejs/plugin-vue"
import path from "path"


export default defineConfig({
	publicDir: false, // 不复制 public 文件夹到 dist
	plugins: [
		vue(),
		visualizer({
			open: true, // 在默认用户代理中打开生成的文件
			gzipSize: true, // 收集 gzip 大小并将其显示
			brotliSize: true, // 收集 brotli 大小并将其显示
			filename: "stats.html", // 分析图生成的文件名
		}),
		copy({
			targets: [{ src: "src/assets", dest: "dist" }] // 执行静态资源拷贝
		})
	],
	build: {
		outDir: "dist",
		emptyOutDir: false, // 是否清空目标文件夹，清空的话复制的资源文件会丢失
		lib: {
			entry: "src/index.ts",
			name: "galacean-demo"
	  	},
		minify: "terser", // 是否禁用最小化混淆，esbuild 打包速度最快，terser 打包体积最小
        terserOptions: {  
            compress: {  
                pure_funcs: ["console.log"], // 只删除 console.log 
                drop_debugger: true // 删除 debugger  
            }  
        },
		rollupOptions: {
			external: [ //忽略打包的文件
				"@galacean/engine",
				"@galacean/engine-spine",
				"@galacean/engine-toolkit-controls",
				"@types/dat.gui",
				"dat.gui",
				"vue",
				/assets/
			],
			output: {
				globals: { // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
					"@galacean/engine": "galaceanEngine",
					"@galacean/engine-spine": "galaceanEngineSpine",
					"@galacean/engine-toolkit-controls": "galaceanEngineToolkitControls",
					"@types/dat.gui": "typesDatGui",
					"dat.gui": "datGui",
					"vue": "Vue"
				}
			}
		}
	},
	resolve: {
		alias:{
			"@": path.resolve("./src")
		}
	},
	
})
