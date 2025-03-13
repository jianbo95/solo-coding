import Constant from '../../app/Constants'
export default function(orderId, canvasId) {

	$("#" + canvasId).html("");
	var graph = new Q.Graph(canvasId);

	function onDataCollected(txt) {
		var json = JSON.parse(txt);
		translateToQuneeElements(json, graph);
	}
	function translateToQuneeElements(json, graph) {
		var map = {};
//		if (json.nodes) {
//			Q.forEach(json.nodes, function(data) {
//				var node = graph.createNode(data.name, data.x || 0, data.y || 0);
//				node.set("data", data);
//				map[data.id] = node;
//			});
//		}
		if (json.Customer) {
			Q.forEach(json.Customer, function(data) {
				var node = createNode(Customer, data.name, data.x || 0, data.y || 0,data.ys,data.xz);
				node.set("data", data);
				map[data.id] = node;
			});
		}
		if (json.CRM) {
			Q.forEach(json.CRM, function(data) {
				var node = createNode(CRM, data.name, data.x || 0, data.y || 0,data.ys,data.xz);
				node.set("data", data);
				map[data.id] = node;
			});
		}
		if (json.Billing) {
			Q.forEach(json.Billing, function(data) {
				var node = createNode(Billing, data.name, data.x || 0, data.y || 0,data.ys,data.xz);
				node.set("data", data);
				map[data.id] = node;
			});
		}
		if (json.Pmt) {
			Q.forEach(json.Pmt, function(data) {
				var node = createNode(Pmt, data.name, data.x || 0, data.y || 0,data.ys,data.xz);
				node.set("data", data);
				map[data.id] = node;
			});
		}
		if (json.edges) {
			Q.forEach(json.edges, function(data) {
				var from = map[data.from];
				var to = map[data.to];
				if (!from || !to) {
					return;
				}
//				var edge = graph.createEdge(data.name, from, to);
				var edge = createEdge(data.name, from, to, data.corlor);
//				console.log(data.corlor);
//				if (data.corlor) {
//					edge.setStyle(Q.Styles.EDGE_COLOR, data.corlor);
//				}
				edge.set("data", data);
				console.log("create edge");
			}, graph);
		}
	}
	graph.ondblclick = function(evt) {
		var node = evt.data;
		if (node) {
			var newName = prompt("New Name:");
			if (newName) {
				node.name = newName;
			}
		}
	}
	


	graph.moveToCenter();

	var GRADIENT = new Q.Gradient(Q.Consts.GRADIENT_TYPE_RADIAL, [Q.toColor(0xAAFFFFFF), Q.toColor(0x11FFFFFF)], [0.1, 0.9]);
	GRADIENT.position = Q.Position.RIGHT_TOP;
	GRADIENT.tx = -10;
	var RECT = Q.Shapes.getRect(0, 0, 90, 50, 10);
	var DIAMOND = Q.Shapes.getShape(Q.Consts.SHAPE_DIAMOND, 0, 0, 100, 80);
	// var BLUE = "#0000FF";
	var BLUE = "#ff0";
	var RED = "#FF0000";
	var GRAY = "#555";


	function createText(text, x, y) {
		var node = graph.createText(text, x, y);
		node.anchorPosition = Q.Position.LEFT_BOTTOM;
		return node;
	}

	function createNode(host, name, x, y, highlight, isDiamond) {
		var node = graph.createNode(name, x, y);
		// node.setStyle(Q.Styles.SHAPE_FILL_COLOR, highlight ? BLUE : "#DDD");
		node.setStyle(Q.Styles.SHAPE_FILL_COLOR, highlight ? BLUE : "#f9f9f9");
		node.setStyle(Q.Styles.SHAPE_FILL_GRADIENT, GRADIENT);
		node.setStyle(Q.Styles.SHAPE_STROKE, 1);
		// node.setStyle(Q.Styles.SHAPE_STROKE_STYLE, "#888888");
		node.setStyle(Q.Styles.SHAPE_STROKE_STYLE, "#001528");
		node.setStyle(Q.Styles.LABEL_ANCHOR_POSITION, Q.Position.CENTER_MIDDLE);
		node.setStyle(Q.Styles.LABEL_POSITION, Q.Position.CENTER_MIDDLE);
		node.image = isDiamond ? DIAMOND : RECT;

		if (host) {
			node.parent = host;
			node.host = host;
		}
		return node;
	}

	function createRect(name, left, top, width, height, fillColor) {
		var rect = graph.createNode(name, left, top);
		rect.anchorPosition = Q.Position.LEFT_TOP;
		rect.image = Q.Shapes.getRect(0, 0, width, height);
		rect.setStyle(Q.Styles.SHAPE_STROKE, 0.3);
		rect.setStyle(Q.Styles.LABEL_ANCHOR_POSITION, Q.Position.CENTER_TOP);
		rect.setStyle(Q.Styles.LABEL_POSITION, Q.Position.LEFT_MIDDLE);
		rect.setStyle(Q.Styles.LABEL_ROTATE, -Math.PI / 2);
		rect.setStyle(Q.Styles.LABEL_PADDING, 5);
		if (fillColor) {
			rect.setStyle(Q.Styles.SHAPE_FILL_COLOR, fillColor);
		}
		return rect;
	}
	function createEdge(name, from, to, edgeColor, edgeType) {
		var edge = graph.createEdge(name, from, to);
		edge.setStyle(Q.Styles.LABEL_RADIUS, 0);
		edge.setStyle(Q.Styles.LABEL_ROTATABLE, false);
		edge.setStyle(Q.Styles.LABEL_BACKGROUND_COLOR, "#FFFFFF");
		edge.setStyle(Q.Styles.LABEL_ANCHOR_POSITION, Q.Position.CENTER_MIDDLE);
		edge.setStyle(Q.Styles.LABEL_BACKGROUND_COLOR, "#FFFFFF");
		//    edge.setStyle(Q.Styles.ARROW_TO, false);
		if (edgeColor) {
			edge.setStyle(Q.Styles.EDGE_COLOR, edgeColor);
		}else{
			edge.setStyle(Q.Styles.EDGE_COLOR,'#1f2d3d')
		}

		if (edgeType) {
			edge.edgeType = edgeType;
		}
		return edge;
	}





	//text
	createText("流程图", -100, 22);
	// var Customer = createRect("分公司", -100, 25, 850, 90, "#FF0");
	// var CRM = createRect("查勘", -100, 115, 850, 195, "#FFF");
	// var Billing = createRect("拍卖", -100, 310, 850, 80, "#FF0");
	// var Pmt = createRect("总公司", -100, 390, 850, 90, "#FFF");

	var Customer = createRect("审核", -100, 25, 850, 90, "#1ab394");
	var CRM = createRect("员工", -100, 115, 850, 195, "#f3f3f4");
	var Billing = createRect("拍卖商", -100, 310, 850, 80, "#1ab394");
	var Pmt = createRect("总公司", -100, 390, 850, 90, "#f3f3f4");
	var url = location.href;
	var id = orderId;
	
	// $($("#" + canvasId + " .Q-Canvas")[1]).hide();

	Core.post(Constant.root + "workHelper/flow",{id:id},(result)=>{
		onDataCollected(JSON.stringify(result))
		// callback()
		
	})
}
