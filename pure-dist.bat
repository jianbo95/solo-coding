rem pure 模式启动

@echo off


cd /d %~dp0/

set jar="%cd%/conf/pure/smarthttp-1.0-jar-with-dependencies.jar"

set OPTION=confDir=%cd%/conf/test/conf/ frontDir=%cd%/

echo jar=%jar%
echo option=%OPTION%
echo --------------------------

java -jar %jar% %OPTION%