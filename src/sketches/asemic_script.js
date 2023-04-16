import React, { useState, useEffect } from "react";
import Sketch from "react-p5";
import P5InstanceContext from '../P5InstanceContext';

	export default (props) => {

		const CANVAS_SIZE = 500;
  		const CANVAS_WIDTH = window.innerWidth;
  		const CANVAS_HEIGHT = window.innerHeight;
 		const CENTER = CANVAS_SIZE / 2;
  		const [p5Instance, setP5Instance] = useState(null);
  		const [sliderValue, setSliderValue] = useState(0.25); 
  		const [squishXMedian, setSquishXMedian] = useState(0.25);
		const [squishXVariance, setSquishXVariance] = useState(0);
		const [showSlider, setShowSlider] = useState(false); 
		const [squishXVarianceValue, setSquishXVarianceValue] = useState(0);





		useEffect(() => {
			if (p5Instance) {
			  props.setP5Instance(p5Instance);
			}
			return () => {
			  props.setP5Instance(null);
			};
		  }, [p5Instance]);
		
		  useEffect(() => {
			if (p5Instance) {
			  p5Instance.redraw();
			}
		  }, [p5Instance, props.regenerate]);
		
		  useEffect(() => {
			if (p5Instance) {
			  p5Instance.redraw();
			}
		  }, [p5Instance, squishXMedian]);

		  useEffect(() => {
			if (p5Instance) {
				p5Instance.redraw();
			}
		}, [p5Instance, squishXVariance]);

	const setup = (p5, canvasParentRef) => {
		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)
		p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).parent(canvasParentRef);

		p5.noLoop();
	};


	const handleSliderChange = (event) => {
		console.log("Slider value changed:", event.target.value);
		setSliderValue(event.target.value);
		setSquishXMedian(event.target.value);
		setSquishXVariance(event.target.value);
	};

	

	//----------------
	//Helper Functions
	//----------------

	function scaleZeroedVectorsToCanvas(p5, points, width){
		console.log("szvtc", points);

		let scaled_points = [];
		points.forEach(point => {
			scaled_points.push(point.mult(p5.width/width).copy());
		});
		return scaled_points;
	}

	//Individual Glyph Drawing
	function scaleVectorsToCanvas(p5, points){
		console.log("svtc", points);
		let scaled_points = [];
		points.forEach(point => {
			scaled_points.push(point.mult(p5.width/2).add(p5.createVector(CENTER, CENTER)).copy());
		});
		return scaled_points;
	}
	
	function arrayVectorToPair(vectors){
		let pairs = [];
		vectors.forEach(vector => {
			pairs.push([vector.x, vector.y]);
		});
		return pairs;
	}

	//----------------
	//Generate Domain Functions
	//----------------

	function generatePointInUnitCircle(p5){
		let radius = p5.sqrt(p5.random());
		let theta = p5.random(0, p5.TWO_PI);
		return p5.createVector(radius * p5.cos(theta), radius * p5.sin(theta));
	}

	function generateGlyphDomain(p5){
		let centroids = [];
		for (let i = 0; i < 5; i++) {
			let point = generatePointInUnitCircle(p5);

			centroids.push(point.copy());
		}

		return centroids;
	}

	//----------------
	//Drawing Functions
	//----------------

	//generate a spline using points as array of [x,y] arrays
	function generateSpline(p5, points){
		p5.noFill();
		console.log(points.length);
		p5.beginShape();
		p5.curveVertex(points[0].x, points[0].y);
		points.forEach(point => {
			p5.curveVertex(point.x, point.y);
		})
		p5.curveVertex(points[points.length-1].x, points[points.length-1].y);
		p5.endShape();
	}

	function createGlyph(p5, points){
		generateSpline(p5, points);
	}

	//generate a Bezier curve of any order using p5 vectors and return points at each steps
	function generateBezier(p5, points, steps) {
		console.log('bezier points', points);
	    let intermediatePoints = [];
		p5.noFill();
		p5.beginShape();
		for (let t = 0; t <= 1; t += 1/steps) {
			  let x = 0;
			let y = 0;
			for (let i = 0; i < points.length; i++) {
				let a = factorial(points.length - 1) / (factorial(i) * factorial(points.length - 1 - i));
				let b = Math.pow(1 - t, points.length - 1 - i) * Math.pow(t, i);
				x += a * b * points[i].x;
				y += a * b * points[i].y;
			   
			 }
			  p5.vertex(x, y);
		   intermediatePoints.push(p5.createVector(x,y));
		}
		p5.endShape();
	    return intermediatePoints;
	}
	 
	function factorial(n) {
		if (n === 0) {
		   return 1;
		}
		let result = 1;
		for (let i = 1; i <= n; i++) {
			result *= i;
		}
		return result;
    }

	//----------------
	//Generate Random Points from Centroids Functions
	//----------------

	function indexClosestCentroid(p5, centroids, point){
		let closestIndex = 0;
		let closest = centroids[0];
		for(let i = 0; i < centroids.length; i++){
			if(centroids[i].dist(point) < closest.dist(point)){
				closest = centroids[i];
				closestIndex = i;
			}
		}
		return closestIndex;
	}

	function generateRandomPointsNaive(p5, centroids){
		let points = [];
		let pointInCell = [];
		centroids.forEach(x => {
			pointInCell.push(false);
		});
		while(points.length !== centroids.length){
			let point = generatePointInUnitCircle(p5);
			let index = indexClosestCentroid(p5, centroids, point);
			if(!pointInCell[index]){
				pointInCell[index] = true;
				points.push(point);
			}
		}
		return points;
	}

	function squishGlyphs(p5, glyphs, squishXFactor, squishYFactor, squishXVarianceValue, squishYVariance) {
		glyphs.forEach(points =>{
			points.forEach(point =>{
				point.mult(squishXFactor + p5.random(-squishXVarianceValue, squishXVarianceValue), squishYFactor + p5.random(-squishYVariance, squishYVariance));
			})
		});
	}
	
	function rotateGlyphs(p5, glyphs, angleMedian, angleVariance){
		glyphs.forEach(points =>{
			points.forEach(point =>{
				point.rotate(angleMedian + p5.random(-angleVariance, angleVariance))			
			})
		});
	}
	
	function offsetGlyphs(p5, glyphs, offsetVariance){
		glyphs.forEach(points =>{
			let offset = p5.random(-offsetVariance, offsetVariance);
			points.forEach(point =>{
				point.add(0, offset)			
			})
		});
	}

	//given a row of glyphs as array of points, return array containing subarray of points. (Variance cannot be greater than or equal to median)
	function applyWordLengthVariation(p5, glyphsRow, numOfCtrlPts, median, variance){
		let arrayOfSubArrays = [];

		let totalLength = p5.floor(glyphsRow.length/numOfCtrlPts);
		let coveredLength = 0;

		if(variance >= median || median >= totalLength){
			arrayOfSubArrays.push(glyphsRow);
			return arrayOfSubArrays;
		}
		
		while(coveredLength !== totalLength){
			let length = p5.floor(p5.random(median - variance, median + variance));
			console.log("length", length);
			if(length + coveredLength > totalLength){
				length = totalLength - coveredLength;
			}
			console.log("glyphsRow before slicing", glyphsRow);
			arrayOfSubArrays.push(glyphsRow.slice(coveredLength * numOfCtrlPts, (coveredLength + length) * numOfCtrlPts));
			coveredLength += length;
		}

		return arrayOfSubArrays;
	}


	//----------------
	//GlyphBox Function
	//----------------

	function placeGlyphsInGlyphBox(p5, pointsArr, horizontalSegments, verticalSegments){
		let row = [];
		let col = [];
		let glyph = [];
		let horizontalCounter = 0;
		let verticalCounter = 0;

		for(let i = 0; i < pointsArr.length; i++){
			for(let j = 0; j < pointsArr[i].length; j++){
				let point = pointsArr[i][j].copy();
				point.add(horizontalCounter * 2 + 1, verticalCounter * 2 + 1);
				col.push(point);
			}
			horizontalCounter++;
			if(horizontalCounter === horizontalSegments){
				verticalCounter++;
				horizontalCounter = 0;
				row.push(col);
				col = [];
			}
		}
		return row;
	}

	//----------------
	//Driver Function
	//----------------

	const draw = (p5) => {
		// NOTE: Do not use setState in the draw function or in functions that are executed
		// in the draw function...
		// please use normal variables or class properties for these purposes
		
		//--- User Input Variables ---//
		let centroidsPerCentroidSet = 5;
		let centroidSetsForGlyphGeneration = 1;
		let squishXMedian = 0.25;
		let squishXVariance = 0;
		let squishYMedian = 1;
		let squishYVariance = 0;
		let rotationMedian = 0;
		let rotationVariance = 0;
		let lineOffsetVariance = 0.5;
		let wordLengthMedian = 5;
		let wordLengthVariance = 2;

		//--- Define Division of Screen Space ---//
		let horizontalSegments = 20; 
		let verticalSegments = 20;

		//--- Drawing Settings ---//
		p5.background(255);
		p5.stroke("black");
		p5.strokeWeight(1);

		//--- Generate Centroids ---//
		let centroidSet = [];
		for(let i = 0; i < centroidSetsForGlyphGeneration; i++){
			let centroids = generateGlyphDomain(p5);
			centroidSet.push(centroids);
		    console.log("centroids", centroids);
		}
		console.log("centroid set", centroidSet);

		//--- Create a Glyph for Each Segment ---//
		let glyphsArr = [];
		for(let i = 0; i < horizontalSegments * verticalSegments; i++){
			let centroidChoice = Math.floor(Math.random() * centroidSetsForGlyphGeneration);
			let centroids = centroidSet[centroidChoice];
			let points = generateRandomPointsNaive(p5, centroids);
			glyphsArr.push(points);
		}
		
		//--- Modify Points in Unit Circle Space ---//
		squishGlyphs(p5, glyphsArr, sliderValue, squishYMedian, squishXVarianceValue, squishYVariance);
		rotateGlyphs(p5, glyphsArr, rotationMedian, rotationVariance);
		offsetGlyphs(p5, glyphsArr, lineOffsetVariance);

		//--- Create the Box of Horizontal Segments x Vertical Segments ---//
		let glyphBox = placeGlyphsInGlyphBox(p5, glyphsArr, horizontalSegments, verticalSegments);
		console.log("glyphBox", glyphBox);

		//--- Slice Glyph Rows in Several Segments ---//
		let segmentedGlyphBox = [];
		for(let i = 0; i < glyphBox.length; i++){
			let segmentedGlyphRow = applyWordLengthVariation(p5, glyphBox[i], 5, wordLengthMedian, wordLengthVariance);
			console.log("Segmented glyph row", segmentedGlyphRow);
			segmentedGlyphBox.push(segmentedGlyphRow);
		}
		console.log("segmentedGlyphBox", segmentedGlyphBox);

		//--- Convert Rows of Glyphs (len 40) into Screen Space and Draw ---//
		for(let i = 0; i < segmentedGlyphBox.length; i++){
			for(let j = 0; j < segmentedGlyphBox[i].length; j++){
				createGlyph(p5, scaleZeroedVectorsToCanvas(p5, segmentedGlyphBox[i][j], horizontalSegments * 2));
			}
		}
		
		//--- Frontend Requirements ---//
		if (!p5Instance) {
			setP5Instance(p5);
		}
		
	};

	return (
		<P5InstanceContext.Provider value={p5Instance}>
		  <div style={{ position: "relative", width: "100%", height: CANVAS_HEIGHT }}>
			{showSlider && (
			  <div style={{ position: "absolute", top: "80px", right: "10px", zIndex: "1", backgroundColor: "#fafafa", width: "200px", padding: "10px" }}>
				
				<div style={{ marginBottom: "10px" }}>SquishMedian</div>
				<div style={{ position: "relative" }}>
				  <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "10px", backgroundColor: "white" }}></div>
				  <input type="range" min="0" max="1" step="0.01" value={sliderValue} onChange={handleSliderChange} style={{ width: "100%" }} />
				</div>

				<div style={{ marginBottom: "10px" }}>Input 2</div>
				<div style={{ position: "relative" }}>
  				<div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "10px", backgroundColor: "white" }}></div>
				  <input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={squishXVarianceValue}
  onChange={(event) => setSquishXVarianceValue(parseFloat(event.target.value))}
  style={{ width: "100%" }}
/>				</div>


			  </div>
			)}
			<Sketch setup={setup} draw={draw} />
			<div className="input-container" style={{ position: "absolute", top: "10px", right: "10px", zIndex: "1" }}>
			  <button className="download-button" onClick={() => setShowSlider(!showSlider)}>Toggle Inputs</button>
			</div>
		  </div>
		</P5InstanceContext.Provider>
	  );  

};