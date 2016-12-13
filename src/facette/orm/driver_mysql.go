// +build !disable_mysql

package orm

import (
	"fmt"
	"reflect"
	"strconv"
	"time"

	"github.com/go-sql-driver/mysql"
)

// mysqlDriver implements the database driver interface for MySQL.
type mysqlDriver struct {
	commonDriver
	dbName string
}

func (d mysqlDriver) QuoteName(name string) string {
	return fmt.Sprintf("`%s`", name)
}

func (d *mysqlDriver) init() error {
	// Get current database name
	return d.db.Select("database()").quiet().Row().Scan(&d.dbName)
}

func (d mysqlDriver) name() string {
	return "mysql"
}

func (d mysqlDriver) hasTable(tableName string) bool {
	var count int

	d.db.From("information_schema.tables").
		Where("table_schema = ?", d.dbName).
		Where("table_name = ?", tableName).
		quiet().
		Count(&count)

	return count > 0
}

func (d mysqlDriver) hasColumn(tableName, columnName string) bool {
	var count int

	d.db.From("information_schema.columns").
		Where("table_schema = ?", d.dbName).
		Where("table_name = ?", tableName).
		Where("column_name = ?", columnName).
		quiet().
		Count(&count)

	return count > 0
}

func (d mysqlDriver) hasIndex(tableName, indexName string) bool {
	var count int

	d.db.From("information_schema.statistics").
		Where("table_schema = ?", d.dbName).
		Where("table_name = ?", tableName).
		Where("index_name = ?", indexName).
		quiet().
		Count(&count)

	return count > 0
}

func (d mysqlDriver) typeOf(rv reflect.Value, autoIncrement bool) (string, error) {
	switch rv.Kind() {
	case reflect.Bool:
		return "boolean", nil

	case reflect.Float32, reflect.Float64:
		return "double", nil

	case reflect.Int8:
		if autoIncrement {
			return "tinyint AUTO_INCREMENT", nil
		}
		return "tinyint", nil

	case reflect.Uint8:
		if autoIncrement {
			return "tinyint unsigned AUTO_INCREMENT", nil
		}
		return "tinyint unsigned", nil

	case reflect.Int16:
		if autoIncrement {
			return "smallint AUTO_INCREMENT", nil
		}
		return "smallint", nil

	case reflect.Uint16:
		if autoIncrement {
			return "smallint unsigned AUTO_INCREMENT", nil
		}
		return "smallint unsigned", nil

	case reflect.Int, reflect.Int32:
		if autoIncrement {
			return "int AUTO_INCREMENT", nil
		}
		return "int", nil

	case reflect.Uint, reflect.Uint32:
		if autoIncrement {
			return "int unsigned AUTO_INCREMENT", nil
		}
		return "int unsigned", nil

	case reflect.Int64:
		if autoIncrement {
			return "bigint AUTO_INCREMENT", nil
		}
		return "bigint", nil

	case reflect.Uint64:
		if autoIncrement {
			return "bigint unsigned AUTO_INCREMENT", nil
		}
		return "bigint unsigned", nil

	case reflect.String:
		return "text", nil

	case reflect.Struct:
		if _, ok := rv.Interface().(time.Time); ok {
			return "timestamp", nil
		}

	default:
		if _, ok := rv.Interface().([]byte); ok {
			return "longblob", nil
		}
	}

	return "", ErrUnsupportedType
}

func (d mysqlDriver) scanValue(dst, src reflect.Value) error {
	if dst.Kind() == reflect.Ptr {
		dst.Set(reflect.New(dst.Type().Elem()))
		dst = dst.Elem()
	}

	switch dst.Kind() {
	case reflect.Bool:
		v, err := strconv.ParseBool(string(src.Interface().([]byte)))
		if err != nil {
			return err
		}

		dst.Set(reflect.ValueOf(v))

	case reflect.Float32, reflect.Float64:
		bitSize := 64
		if dst.Kind() == reflect.Float32 {
			bitSize = 32
		}

		v, err := strconv.ParseFloat(string(src.Interface().([]byte)), bitSize)
		if err != nil {
			return err
		}

		dst.Set(reflect.ValueOf(v).Convert(dst.Type()))

	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		bitSize := 64
		switch dst.Kind() {
		case reflect.Int8:
			bitSize = 8

		case reflect.Int16:
			bitSize = 16

		case reflect.Int, reflect.Int32:
			bitSize = 32
		}

		v, err := strconv.ParseInt(string(src.Interface().([]byte)), 10, bitSize)
		if err != nil {
			return err
		}

		dst.Set(reflect.ValueOf(v).Convert(dst.Type()))

	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		bitSize := 64
		switch dst.Kind() {
		case reflect.Uint8:
			bitSize = 8

		case reflect.Uint16:
			bitSize = 16

		case reflect.Uint, reflect.Uint32:
			bitSize = 32
		}

		v, err := strconv.ParseUint(string(src.Interface().([]byte)), 10, bitSize)
		if err != nil {
			return err
		}

		dst.Set(reflect.ValueOf(v).Convert(dst.Type()))

	case reflect.Struct:
		if _, ok := dst.Interface().(time.Time); ok {
			t, err := time.Parse(TimeFormat, string(src.Interface().([]byte)))
			if err != nil {
				return err
			}

			dst.Set(reflect.ValueOf(t))
		}

	default:
		return ErrNotScanable
	}

	return nil
}

func (d mysqlDriver) normalizeError(err error) error {
	if _, ok := err.(*mysql.MySQLError); !ok {
		return err
	}

	switch err.(*mysql.MySQLError).Number {
	case 1062:
		return ErrConstraintUnique

	case 1216, 1217, 1451, 1452:
		return ErrConstraintForeignKey

	case 1364:
		return ErrConstraintNotNull
	}

	return err
}

func init() {
	registerDriver("mysql", &mysqlDriver{})
}
