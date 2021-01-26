
// [COMBO] {"material":"ui_editor_properties_elliptical","combo":"ELLIPTICAL","type":"options","default":0}
// [COMBO] {"material":"ui_editor_properties_mode","combo":"MODE","type":"options","default":0,"options":{"Vertex":1,"UV":0}}
// [COMBO] {"material":"ui_editor_properties_perspective","combo":"PERSPECTIVE","type":"options","default":1}

#include "common.h"

uniform mat4 g_ModelViewProjectionMatrix;
uniform float g_Time;
uniform vec4 g_Texture0Resolution;
uniform vec4 g_Texture1Resolution;

uniform float g_Speed; // {"material":"speed","label":"ui_editor_properties_speed","default":1.0,"range":[-5,5]}
uniform vec2 g_SpinCenter; // {"material":"center","label":"ui_editor_properties_center","default":"0.5 0.5","position":true}
uniform float g_Ratio; // {"material":"ratio","label":"ui_editor_properties_ratio","default":1.0,"range":[0,10]}
uniform float g_Axis; // {"material":"angle","label":"ui_editor_properties_angle","default":0.0,"range":[0,3.141]}

attribute vec3 a_Position;
attribute vec2 a_TexCoord;

varying vec4 v_TexCoord;

#if MASK == 1
varying vec2 v_TexCoordMask;
#endif

void main() {

	float aspect = g_Texture0Resolution.z / g_Texture0Resolution.w;
	vec3 position = a_Position;
#if MODE == 1
	position.xy = rotateVec2(position.xy - g_SpinCenter, g_Speed * g_Time) + g_SpinCenter;
#endif
	gl_Position = mul(vec4(position, 1.0), g_ModelViewProjectionMatrix);
	
	v_TexCoord.xyzw = a_TexCoord.xyxy;
	
#if MASK == 1
	v_TexCoordMask = vec2(a_TexCoord.x * g_Texture1Resolution.z / g_Texture1Resolution.x,
						a_TexCoord.y * g_Texture1Resolution.w / g_Texture1Resolution.y);
#endif

#if MODE == 0
#if PERSPECTIVE == 1
	vec2 spinCenter = g_SpinCenter;

	spinCenter.x *= aspect;
	v_TexCoord.x *= aspect;
	v_TexCoord.xy -= spinCenter;

#if ELLIPTICAL
	v_TexCoord.xy = rotateVec2(v_TexCoord.xy, g_Axis);
	v_TexCoord.x *= g_Ratio;
#endif
	
	v_TexCoord.xy = rotateVec2(v_TexCoord.xy, g_Speed * g_Time);
	
#if ELLIPTICAL
	v_TexCoord.x /= g_Ratio;
	v_TexCoord.xy = rotateVec2(v_TexCoord.xy, -g_Axis);
#endif

	v_TexCoord.xy += spinCenter;
	v_TexCoord.x /= aspect;

#else
	v_TexCoord.xy = rotateVec2(v_TexCoord.xy - g_SpinCenter, g_Speed * g_Time) + g_SpinCenter;
#endif
#endif
}
