<template>
	<div class="cc-menu">
			<div class="line">
					<a class="hide-menu">隐藏</a>
			</div>
		<slot></slot>
	</div>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			this.$parent.initMenu(this);
		},
		data: function(){
			return {
				title: null
			}
		},
		methods: {
			// menu 点击事件
			clickMenu: function(name) {
				this.$parent.setFrameTitle(name);
			},
			addItem: function(items, item) {
				if(this.title == null) {
					this.title = item;
				}
			}
		}
	}
</script>
<style type="text/css">
.cc-menu {
	float: left;
	width: 160px;
	height: auto !important;
	overflow: visible !important;
	position: fixed;
	height: 100% !important;
	background-color: #3992d0;
	font-size: 12px;
}
.cc-menu dl,
.cc-menu dt,
.cc-menu dd {
	display: block;
	margin: 0;
}
.cc-menu a {
	text-decoration: none;
	cursor: pointer;
}
.cc-menu .line {
	height: 30px;
	width: 100%;
	background:  #2B7DB4;
	color:#fff;
}
.cc-menu .line .hide-menu{
	line-height: 30px;
	float: left;
	padding-left: 10px;
}
.cc-menu dt {
	padding-left: 40px;
	padding-right: 10px;
	background-repeat: no-repeat;
	background-position: 10px center;
	color: whitesmoke;
	font-size: 14px;
	position: relative;
	line-height: 48px;
	cursor: pointer;
}
.cc-menu dd {
	background-color: #317eb4;
	padding-left: 40px;
	display: none;
	padding-top: 10px;
}
.cc-menu dd a {
	color: whitesmoke;
	/*line-height: 20px;*/

}
.cc-menu dt img {
	position: absolute;
	right: 10px;
	top: 20px;
}
.cc-menu .system dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzM5REY3NzVEOUExMTFFNEIxNUQ5MDQ2NkQ4MUEzNUQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzM5REY3NzREOUExMTFFNEIxNUQ5MDQ2NkQ4MUEzNUQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4v7fBXAAABdElEQVR42qyVsUoDQRCGN0e0uBQBCdiJYG0s9AGsbMRChTSePsGlT2EVLOwscvcCmqQ0lY2VD2BjBDvBVjiEEO6QRNB/YALrsHMxnD98cMzO/Ht7O7tXStPUOFQGJ2Af1MEqx9/BENyBHvjyff9XYclhSEYXYN3k6w2cw7BnBz2R1AHdP5gZzulmWdbRDCMQmsUVwjSSSz4Et6aYjrD8ARnSW36AqjU4ANfgVSneAGf8IjONwAoZBni4EQVbvJubiuEz7/6TiJ9SezQcBZ9gGzwqhjtg7Ig3PJ5JahlMc77XlHOk6mRYcwxMlAJ7wokjXisrBTTRC4jBkrVhI347GlvTjlgCKiJ+DK5y+tLnHKnE492UoqNHDfoN2la8zbGUc6SGWttcgnsufhBju3QgwB5oudqmz8euKtom4ecDXiIp40thlmNEY/f//eh51lGLC5jFZCZvm5CXvqgimIXafdgEgfWd5l2wAcya827sQr+AHwEGAITXadcM/C42AAAAAElFTkSuQmCC);
}
.cc-menu .custom dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkFGMUYzMUVEOUExMTFFNDgxMkU4MjAzRjU1QjNEMzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkFGMUYzMUREOUExMTFFNDgxMkU4MjAzRjU1QjNEMzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz77ALSwAAABqklEQVR42pSUTShFURDH75Usrl6U70cWvnavRG9hQaRY+Fwo5WEjFmyVjw2WIgsrJTZio6wsfKUQq2djRVkQkmLFFSv+ozl13M6cy9Sv7rl3zv/OnJkzru/7jmDDoA+Ug09wAuZBUnfyPO/XJlcQXAc9wo+awP5/BLvApiMbbcgF7ybBFMOGDsdu6aBS+mgSfHDC7Un6YEq5CNxZxDZAQjpDU4T3oAZcC8VK2EJ3LW1DVsJt8wHOwVvQ4S8RKqNKZtNPmTyQE7LHGGE1mAEtBv890K8XJSzCQb4JJrER0MxiUbDFRyJG2AvWhExauUgkeMwZtINdMMEBPCLaFSVYDG4FsWUwBObAqOX4ViE4oAQPQKPgSIV5ATFwwe8WwBmIgzF+F4dgkgQrsLgSxI5APVgCbXx2s2Bc85kGU5QyFS2VR5RkN9r9zufny4CPWheATqpynUWwSnfmZ4qwAWSAWk6frBspZ1KEZRbBGN9tuo6FWsMfglcQCcyAnz6MhkwWGqYe9xwVYpKHR4TPjdanoFT1IY36NPAlCGaBRfCsvaNUtznNHd35W4ABALq3Z8RPIxVbAAAAAElFTkSuQmCC);
}
.cc-menu .channel dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEQwRjQ0N0REOUExMTFFNDhFRjFFMTJGNDRBQjRCODgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEQwRjQ0N0NEOUExMTFFNDhFRjFFMTJGNDRBQjRCODgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7dOIrJAAABk0lEQVR42uyUyytFURTGz73ujXsoz5IwMDLwKiYYUYqRgTI0MTExUhhJmWGIAUX5B0wMjEjeBteMTBiQkpDiHI/r9e36Tn12R111h1b9Ot9eZ+911tl7rxXxPM+hVYAtsAv6nDTNdd0f4xifCbAHKkEVOAfjIesHQCfIBodgFtzrhAgzTILGkMUL8sEN0GzNuQVtyPI4cETBdkgwY/Ogm3pZgpnF+9QlYN33/ZgGrAFP4I2+L47fuQVZoJfvVkAtaAUj9JWCHg1YBsrBJH0v/EgxmAMtkvWU6GnwTN2gh/JK7uj7BBd6kKITonP4V8b3oRkGlhscFCgUf0p03NLB+tCAGbH/gJkNGJVrk0rjlB9ZBMZ8uzmojrNSHHuyXOQCkCdJFKH88s191gxP+DSdZFT8w6J3QD+bwqnc3SFwBa4j0g9NZpesTWMHXFDH8SqbRRdY+2ULkxrQYeFvso7Vjkyb4r45zHLRmmP+sN4OGLSkQdDEjmP64ExINmNggvoGVKMvPoQF/IstgXbQgWBnxvEtwABz0WFnQgTSWQAAAABJRU5ErkJggg==);
}
.cc-menu .app dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUZDMjI3NEJEOUExMTFFNEFBM0VDNjM0OEZGMDA2ODMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUZDMjI3NEFEOUExMTFFNEFBM0VDNjM0OEZGMDA2ODMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5lur0tAAABnklEQVR42qzVTS8DQRjA8e22iCYuDuLtpCLOXg4IB8G5Qh18BiIilMRJIhRx4iuQtFXFSQiJlxMica4baRwluolS8Z/kWRmbTdOqJ/mlO9OZZ2d2Zmc9mUzGcIlyBEUX6pHFE+6RFFm/3/+ro8cl4TDW0GzkjxTCJEzolaZ27UUEiQKSGdJmz7KsCLx2pU9rsIJZo/iYk9+wPuUQokZpEWL6cZVQLcAjGktM+IwmU0ZXajIVDRgzZWvo8YpOnElZPZNuDGIEL7JletCPRa1v0JTOehyjGrtS/sQbTiTJMtLok7orXEvbDpWw1pHwQO56ji/Hf6p9maOs2nikXGfKG2DHh9ytEjW4kXq1aAO4sLcHsYNeDMkj+dmHavhVUr6U6cbl9witCODUMdpx2bt6pNUIHxzTncIqNnFY5Erf+mTFRu1VQptct2AJFdhwdFTTtFwSJv97YwfsRZn5h409zav3bp82UZdpFRPrJIs5j695bP0h2TYW3M7DHCZlgVIFJErJCTOBXL4T2/4EhOT0bpcX337wd9hHzO0T8C3AAGpmaIfcU+hCAAAAAElFTkSuQmCC);
}
.cc-menu .cloud dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzgyOEU0QkVEOUExMTFFNEI4MjlGMDE4RDMxMDYxNjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzgyOEU0QkREOUExMTFFNEI4MjlGMDE4RDMxMDYxNjEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Nxl0vAAABNElEQVR42mL8+vUrAx5QCMRBQKwOxP+B+DoQrwXiyTAFXFxcKBoYcRgoDcQ7gFgHh0XngNgTiF8RYyArEN+HGooP3ANiFaCB/5EFmbAorCHCMBBQAuJydEF0F/JAbRZlIA48ALpQEZsLOYB4OkgBkmF/gPgtDgwDct++fRNAdyEozC4AsRaa7VZAfByHy+yA+CCU/QSI9wNxHdC1D1iAjFYshoGABTSpMKKJ/4fKwYAMEMcCcSDQtTogAxNxuOITEH9ED3OogR+xqAeF/wyQgcI4DGQD4n845DhxiLuADHwOxFJYJMXxxDbOZAWKlBIg3Y1FTgKIX+Ix8AkW8b2wdLgNmpWQwTNojsEGNIFYCE3sByirIifsUiCOBKUtIGYGYgECifoDlAYZcBSUw4DJ5jZAgAEAw49RgRs7Z2IAAAAASUVORK5CYII=);
}
.cc-menu .management dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjBENkM5NUFEOUExMTFFNEFBMUNEQ0NBNkE5N0JCOEYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjBENkM5NTlEOUExMTFFNEFBMUNEQ0NBNkE5N0JCOEYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5sBhiVAAACMElEQVR42oSVS0hVURSG7zkGwYXCCrJRpBBBKOmoZmJF7wsKheajskkoGj2gqKhJZRA9EFGDoHcRJAmpgZGITRsFQqOgnPUQyrx3lDe/Bf+B1enoXfBx7l7n7H+vtfba+wbZbDaVYCEchAxsgjXyf4UPMATP4U86nf5nYpAgWA9dUJZa3D7DBQSfxSPxdlsre7E8jMFbi8j518HTXC7Xs5CgiZ1IiMQm1MF+uJnwvgPR3miwRM99MTEb/4S9cAUmoQg2wBy8gaUwqu/bER0j/ZcWYQCPYmKT2hArfjeUwlroh2HYBZ9gp5t3H9HQIjwAK9yLH4rWOCvfBPyFI8JsOdxz82zcZBE2xGrSonqaTSsaq6PVaQd807sbCXMbTLBSA+ufa3ALzsjXDOthAF5AOTTq3TnoU4vNyldufTjDj2WqTUYpr1Ka12EkFkUtdMI2+MVGFFO7Qflnw4Q2yKcKW7DAt0GoiMxq4CpsVirVmnDcTTit9LbCXagiuss8t0c1t5SjcCPrVapftCl2ple6TXoCJTpNHXDKzX1tgvU6bpFt0Xk+6Xzv1DbVsYUfwHvnO2SCgVaOenEPfIQ2eAVHhdlDpZrRs0ynxuw3FIda+bAPGzZKbLdqaDfLFBxTX47ExMxa2fG8v766Yxvg/Ze0s+ddj3q7g1hb0n2YJGo7Pa5ManRJeOtHrH2xC7ZRN0xpgV60LriI2ONCN3ZKUTSp+BWwWv7vuomG1D7//QXMCzAAFeKnhk9o6zkAAAAASUVORK5CYII=);
}
.cc-menu .source dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REYyNThFRUJEOUEyMTFFNDhBQzU4NTUzRkI0QjU1NzgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REYyNThFRUFEOUEyMTFFNDhBQzU4NTUzRkI0QjU1NzgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmYzgwOTM4LTUyZDAtNGU0Yi05ZmE2LTZhZGNjZmFkMmVhYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4YbG39AAABGElEQVR42mL8//8/AzUBy7dv35D5UkB8Aoi5idR/k4uLywpZgPHr16/I/LNAbESio+YADU2FcZiQJKrJMAwEUoC+DEF3oRYQX6Ug6EARIQV06QuQC1mB+DCFccEIxMeALmVkATImALEQEH+BYnKAABArgswCedkMyHgFxOxArAR1PikuA4FroBQDxCLIsbwMiJ1INBAGFgLDrwI5UkKBeBWF4WgPNPQQyECQsz8CMS+FBr4AGigJiuUlVDAMBCSAsbwA5MJIIOc9VJCTTMM+ATEHEPMjR8pCIBYm08B7QO/mMUCjGgR6gTiOEv8CvfsYaGg3yIX6QP4FKpVeWizQQuE7EP+g0DBQkVfHSO0ClomByoDqBgIEGAAcClMATDbe4gAAAABJRU5ErkJggg==);
}
.cc-menu .statistics dt {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDE0OTQ3MDZEOUE0MTFFNDlCQTRCNjNENDdGOTg2MkMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDE0OTQ3MDVEOUE0MTFFNDlCQTRCNjNENDdGOTg2MkMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlZjJjN2I4LThiZTMtN2M0NS05NWY1LTQwMDlkNGU2YjhmYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz59ZcHhAAABmUlEQVR42pyVTytEURjG516E8WdihAULJdmYUuz4AGJhMTWjWcjKB/AZ7NREacoaxU6RbCXJhhKLQShNGBOpMfnX9bz1TL0dc+9c89Sv3nPueZ+57znvnGs5jhNw0RSYAIOgk3OP4BRsg3XwN1kMDaIg7ZTXNYib+abZgvN/LboZVmJW1JJpOKYepsC5Gh+AETAKch6mk9owqx7MgH01XlVV3HkYvgLbxrlEQZs6pzBoUONmFVcH3BWSzhDDmPGgBxyxXcbBbcC/4jYTtZrAA/ttF7z5fEPRgBi2G5NfoJ5xN6jRbVvGMGz/o5xesAX6WNV7qUVSQpZllpMcVAZcclzqZXIyeeJh4qgyP0GQcZDjD25RUWdiuGGY1KpF9yDPOKPiFpACdaBD5W5avG2e2X+iOe6TzDWCCDgEraCfcRfX77FP5/ljoeI+TBuNneYJy74dM65ScQFcgCEwzLxZ8KMvh6T6GxXAiw/yXL/sdn0lK7hpVrzuQyEGrnwY3YCEmW+5fAIskOAnIKJO8klaA+yANfBtJv4KMACsJoaUGKZdtwAAAABJRU5ErkJggg==);
}
.cc-menu dl dd:last-child {
	padding-bottom: 10px;
}
.cc-menu .active dd {
	display: block;
}
.cc-menu .arrow {
	position: absolute;
	top: 20px;
	right: 10px;
	/*background: #000;*/
	background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAYAAAAx8TU7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0M1NjY2MjFEOUE0MTFFNDk4QkJCRDQ4OEJEMDBDQjUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0M1NjY2MjBEOUE0MTFFNDk4QkJCRDQ4OEJEMDBDQjUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlZjJjN2I4LThiZTMtN2M0NS05NWY1LTQwMDlkNGU2YjhmYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7rXD7JAAAAVklEQVR42mL8+vXrDAYGhnwg/skABUxAnA7E+4BYClkQBKyA+DSUZmAEav/PgAAgI/KYGFABIwizIAk8B+IQID4GU3kciE1AAjCLZgOxIxA/g2kBCDAADuUSOarzCVkAAAAASUVORK5CYII=) no-repeat;
	width: 10px;
	height: 10px;
}
.cc-menu .active .arrow {
	position: absolute;
	top: 20px;
	right: 10px;
	/*background: #000;*/
	background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkNCQTQyRDlEOUE0MTFFNEE3NjFBOEJFQkYxMzU1RTEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkNCQTQyRDhEOUE0MTFFNEE3NjFBOEJFQkYxMzU1RTEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlZjJjN2I4LThiZTMtN2M0NS05NWY1LTQwMDlkNGU2YjhmYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplMDdkYjVkZi02YmExLTdjNDEtYTk2NS1kYjkwNGFhYmI2NjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6Z/LuAAAAAT0lEQVR42mL8+vXrbAYGhhQG7GAOI1ABG5BxAIgt0SSPA7EDSAGIIwXEp6E0CDwHYhMgfsYEFXgGxCFA/AuKQ6BiDDATYCAVSs+GCQAEGABVEBeMx2/2uwAAAABJRU5ErkJggg==) no-repeat;
	width: 10px;
	height: 10px;
}

</style>